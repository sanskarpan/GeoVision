// import { openai } from "@ai-sdk/openai";
// import { azure } from "@ai-sdk/azure"; // You can also use Azure's hosted GPT models. More info: https://sdk.vercel.ai/providers/ai-sdk-providers
// import {
//   type Message,
//   type CoreUserMessage,
//   streamText,
//   convertToCoreMessages,
// } from "ai";

// import { z } from "zod";

// import { NextResponse } from "next/server";

// import {
//   getChatById,
//   saveChat,
//   saveMessages,
//   searchGeeDatasets,
// } from "@/lib/database/chat/queries";
// import {
//   getUsageForUser,
//   getUserRoleAndTier,
//   incrementRequestCount,
// } from "@/lib/database/usage";
// import { getPermissionSet } from "@/lib/auth";
// import {
//   requestGeospatialAnalysis,
//   requestLoadingGeospatialData,
//   requestRagQuery,
//   draftReport,
//   requestWebScraping,
// } from "@/lib/database/chat/tools";
// import {
//   generateUUID,
//   sanitizeResponseMessages,
//   getMostRecentUserMessage,
//   generateTitleFromUserMessage,
//   getFormattedDate,
// } from "@/features/chat/utils/general-utils";

// // export const maxDuration = 30;

// export async function POST(request: Request) {
//   const {
//     id,
//     messages,
//     selectedRoiGeometryInChat,
//     mapLayersNames,
//   }: {
//     id: string;
//     messages: Array<Message>;
//     modelId: string;
//     selectedRoiGeometryInChat: any;
//     mapLayersNames: string[];
//   } = await request.json();

//   // Mock user ID for local testing - no authentication required
//   const userId = "local-user-id";

//   // Fetch the user's role + subscription
//   const userRoleRecord = await getUserRoleAndTier(userId);
//   if (!userRoleRecord) {
//     return NextResponse.json(
//       { error: "Failed to get role/subscription" },
//       { status: 403 }
//     );
//   }

//   const { role, subscription_tier: subscriptionTier } = userRoleRecord;
//   const { maxRequests, maxArea } = await getPermissionSet(
//     role as "ADMIN" | "USER" | "TRIAL",
//     subscriptionTier as "Essentials" | "Pro" | "Enterprise"
//   );
//   const usage = await getUsageForUser(userId);
//   if (usage.requests_count >= maxRequests) {
//     return NextResponse.json(
//       { error: "Request limit exceeded" },
//       { status: 403 }
//     );
//   }

//   const cookieStore = request.headers.get("cookie");
//   const chat = await getChatById(id);

//   const coreMessages = convertToCoreMessages(messages);
//   const userMessage = getMostRecentUserMessage(coreMessages);

//   // Increment usage count
//   await incrementRequestCount(userId);

//   if (!chat) {
//     const generatedTitle = await generateTitleFromUserMessage({
//       message: messages[0] as CoreUserMessage,
//     });
//     await saveChat({ id: id, title: generatedTitle });
//   }

//   const userMessageId = generateUUID();
//   await saveMessages({
//     messages: [
//       {
//         ...userMessage,
//         id: userMessageId,
//         createdAt: new Date(),
//         chatId: id,
//       },
//     ],
//   });

//   // System instructions
//   const systemInstructions = `Today is ${getFormattedDate()}. You are an AI Assistant specializing in geospatial analytics. 
//   Be kind, warm, and professional. Use emojis where appropriate to enhance user experience. 
//   When user asks for a geospatial analysis or data, never ask for the location unless you run the analysis and you get a corresponding error. Users provide the name of their region of interest (ROI) data when requesting an analysis.
//   Always highlight important outputs and provide help in interpreting results. NEVER include map URLs or map legends/palette (like classes) in your responses.
//   Refuse to answer questions irrelevant to geospatial analytics or the platform's context. You have access to several tools. If running a tool fails, and you thought you would be to fix it with a change, try 3 times until you fix it.
//   IF USER ASKS FOR DRAFTING REPORTS, YOU SHOULD RUN THE "draftReport" TOOL, AND JUST CONFIRM THE DRAFTING OF THE REPORT. YOU SHOULD NOT EVER DRAFT REPORT IN THE CHAT."
//   You also have access to a tool that can load geospatial data. First, run the tool that searches the database containing GEE datasets information to find the datasets best match user's request. Afterwards, run the web scraper tool to find extra info such as how to set the visualization parameter (pay attention to the code snippet from the official doc you will recieve). After that provide a short summary of what data with what parameters you're going to load to make sure if it's exactly what the user needs. After everything goes well and the user confirmed the details of the analysis to run, use all the information to load the dataset. 
//   Another tool you have access to is a RAG query tool that you can use to answer questions you don't know the answer to.
//   Before running any geospatial analysis, make sure the layer name doesn't already exist in the map layers. No geospatial analysis is available for the year 2025, so you SHOULD NOT run analysis for 2025 even if the user asks for it.
//   When executing analyes (not ragQueryRetrieval, though):
//   1. Always provide a clear summary of what was analyzed
//   2. Highlight key findings and patterns in the data,
//   3. Try to tabulate some parts of the results/descriptions for the sake of clarity.`;

//   // Prepend system instructions to the conversation as a separate message for the AI
//   const systemMessage = {
//     role: "assistant", // Change role to "assistant" to avoid unhandled role errors
//     content: systemInstructions,
//   };

//   // Add the system message at the beginning of the conversation
//   const processedMessages = [
//     systemMessage,
//     ...messages.filter((msg: any) => msg.role !== "system"),
//   ] as Array<Message>;

//   const result = await streamText({
//     model: openai("gpt-4o"),
//     // model: azure("gpt-4o"),  // You can also use Azure's hosted GPT models
//     maxSteps: 5,
//     messages: convertToCoreMessages(processedMessages),
//     onFinish: async ({ response }) => {
//       if (userId) {
//         try {
//           const responseMessagesWithoutIncompleteToolCalls =
//             sanitizeResponseMessages(response.messages);

//           await saveMessages({
//             messages: responseMessagesWithoutIncompleteToolCalls.map(
//               (message) => {
//                 const messageId = generateUUID();

//                 return {
//                   id: messageId,
//                   chatId: id,
//                   draftedReportId: null,
//                   role: message.role,
//                   content: message.content,
//                   createdAt: new Date(),
//                 };
//               }
//             ),
//           });
//         } catch (error) {
//           console.error("Failed to save chat");
//         }
//       }
//     },

//     tools: {
//       requestGeospatialAnalysis: {
//         description: `Today is ${getFormattedDate()}, so you should be able to help the user with requests by up to this date. No analysis should be done for the year of 2025 as analyses are not yet ready for the new year.
//           After running an analysis: 1. Provide a clear summary of what was analyzed and why, 2. Explain the key findings and their significance. NEVER PROVIDE MAP URLs or MAP LEGENDS FROM THE ANALYSES IN THE RESPONSE. Also the maximum area the user can request analysis for is ${maxArea} sq km. per request.
//           It should be noted that the land cover map (start date: 2015) and bi-temporal land cover change map (start date: 2015) are based on Sentinel-2 imagery, UHI (start date: 2015) is based on Landsat imagery. For all "CHANGE" maps, the user must provide "startDate2 and endDate2". If in doubt about an analysis (e.g., it may not exactly match the analysis we have), you have to double check with the user.`,
//         parameters: z.object({
//           functionType: z.string()
//             .describe(`The type of analysis to execute. It can be one of the following:
//             'Urban Heat Island (UHI) Analysis',
//             'Land Use/Land Cover Maps',
//             'Land Use/Land Cover Change Maps'.`),
//           startDate1String: z
//             .string()
//             .describe(
//               "The start date for the first period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
//             ),
//           endDate1String: z
//             .string()
//             .describe(
//               "The end date for the first period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
//             ),
//           startDate2String: z
//             .string()
//             .optional()
//             .describe(
//               "The start date for the second period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
//             ),
//           endDate2String: z
//             .string()
//             .optional()
//             .describe(
//               "The end date for the second period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
//             ),
//           aggregationMethod: z.string().describe(
//             `The method to use for aggregating the data. It means that in a time-series, what method is used to aggregate data for a given point/pixel in the final map/analysis delivered. For land use/land cover mapping, it's always "Median", and thus you don't need to ask user for that. It can be one of the following:
//             'Mean',
//             'Median',
//             'Min',
//             'Max',
//             . Note that the user may not provide it, so by default its value should be 'Max', and you should not ask the user to tell you what method to use. If the default value is used, make sure to mention it in the response to user that your analysis is based on the maximum va.
//           `
//           ),
//           layerName: z
//             .string()
//             .describe(
//               "The name of the layer to be displayed. You ask the user about it if they don't provide it. Otherwise, use a name based on the function type, but make sure the name is concise and descriptive. "
//             ),
//           title: z
//             .string()
//             .optional()
//             .describe(
//               "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
//             ),
//         }),
//         execute: async (args) =>
//           requestGeospatialAnalysis({
//             ...args,
//             cookieStore,
//             selectedRoiGeometryInChat,
//             maxArea,
//           }),
//       },
//       requestLoadingGeospatialData: {
//         description: `The user has requested loading and visualizing geospatial data. You should load the data based on the user's request.`,
//         parameters: z.object({
//           geospatialDataType: z.string().describe(
//             `The type of geospatial data to load. It can be one of the following:
//       'Load GEE Data'`
//           ),
//           selectedRoiGeometry: z
//             .object({
//               type: z.string().optional(),
//               coordinates: z.array(z.array(z.array(z.number()))).optional(),
//             })
//             .optional()
//             .describe(
//               "The selected region of interest (ROI) geometry. You should run the analysis based on the user's request."
//             ),
//           dataType: z
//             .string()
//             .describe(
//               `The type of data to load. It can be one of the following: 'Image', 'ImageCollection'.`
//             ),

//           divideValue: z
//             .number()
//             .describe(
//               `The value to divide the image by. If based on the scraped data you didn't find it, use your logic to see if it should be set based on the dataset. Sometimes, the division is done within a "cloud mask" function, so you should extract its value from there in that case. If you decide not to set it, set it to 1.`
//             ),
//           datasetId: z.string().describe("The ID of the GEE dataset to load."),
//           startDate: z
//             .string()
//             .describe(
//               "The start date for the data to load. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
//             ),
//           endDate: z
//             .string()
//             .describe(
//               "The end date for the data to load. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
//             ),
//           visParams: z.union([
//             // single-band case
//             z.object({
//               bands: z.array(z.string()).length(1),
//               palette: z.array(z.string()),
//               min: z.number().optional(),
//               max: z.number().optional(),
//             }),
//             // multi-band case
//             z.object({
//               bands: z.array(z.string()),
//               min: z.number().optional(),
//               max: z.number().optional(),
//             }),
//           ])
//             .describe(`You should set the visualization parameters best matching user's request for the data to load and best way of visualization:
//             1) If you want to combine more than one band for visualization, set visParams using the bands: [...] attribute.
//             2) Otherwise, use the palette: [...] attribute (and do not include bands).
//             As an example, RGB visualization should be set as: {bands: ['red', 'green', 'blue']}. Forest loss should be using pellete if it's one band.
//       `),
//           labelNames: z
//             .array(z.string())
//             .describe(
//               "The label names for the data to load. You should run the analysis based on the user's request. Choose the closet label names even if it doesn't 100% match what you already know. Infer it."
//             ),
//           layerName: z
//             .string()
//             .describe(
//               "The name of the layer to be displayed. You ask the user about it if they don't provide it. Otherwise, use a name based on the function type, but make sure the name is concise and descriptive. "
//             ),
//           title: z
//             .string()
//             .optional()
//             .describe(
//               "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
//             ),
//         }),
//         execute: async (args) => {
//           return requestLoadingGeospatialData({
//             ...args,
//             cookieStore,
//             selectedRoiGeometryInChat,
//           });
//         },
//       },
//       searchGeeDatasets: {
//         description: `Find the datasets available in Google Earth Engine (GEE) that best match the user's query.`,
//         parameters: z.object({
//           query: z.string().describe("The name of the dataset to search."),
//           startDate: z
//             .string()
//             .optional()
//             .describe(
//               "The start date for the data to load based on the scraping results. This could be the year or the date in a format. This shows the start date the data is available."
//             ),
//           endDate: z
//             .string()
//             .optional()
//             .describe(
//               "The end date for the data to load based on the scraping result. This could be the year or the date in a format. This shows the end date the data is available."
//             ),
//           title: z
//             .string()
//             .optional()
//             .describe(
//               "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
//             ),
//         }),
//         execute: async (args) => {
//           const result = searchGeeDatasets(args.query);
//           return result;
//         },
//       },

//       scrapeWebpage: {
//         description:
//           "Scrape the webpage of the GEE dataset to learn what dataset_id, how data is visualized, legends, any division by a value, etc. you should use for the the requested dataset. For example, one of the things you should learn is whether you need to have a band combination (e.g., [b1, b2, b3]) or a palette (e.g., ['red', 'green', 'blue']) to visualize the image.",
//         parameters: z.object({
//           url: z
//             .string()
//             .describe(
//               "The asset URL of the webpage to scrape. The name of the column you're scraping for this parameter should be 'asset_url'."
//             ),
//           title: z
//             .string()
//             .optional()
//             .describe(
//               "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
//             ),
//         }),

//         execute: async (args) => {
//           return requestWebScraping(args);
//         },
//       },
//       requestRagQuery: {
//         description: `The user has some documents with which a RAG has been built. If you're asked a question that you didn't know the answer, run the requestRagQuery tool that is based on user's documents to get the answer.`,
//         parameters: z.object({
//           query: z.string().describe("The user's query text."),
//           title: z
//             .string()
//             .optional()
//             .describe(
//               "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
//             ),
//         }),
//         execute: async (args) => requestRagQuery({ ...args, cookieStore }),
//       },
//       draftReport: {
//         description: `When this tool is called, draft a report that summarizes the analyses and their results. The report should be concise and easy to understand, highlighting the key findings and insights. Markdown is supported.`,
//         parameters: z.object({
//           messages: z
//             .array(z.object({}))
//             .describe(
//               "The messages exchanged between the user and the you. You should use relevant messages in the chat to generate the report the user requested. Make sure you format the report in a standard way with all the common structures."
//             ),
//           title: z
//             .string()
//             .optional()
//             .describe(
//               "Briefly describe the title of the report to be drafted in one sentence confirming you're working on the user's request."
//             ),
//           reportFileName: z
//             .string()
//             .optional()
//             .describe("Provide a concise name for the report file."),
//         }),
//         execute: async (args) =>
//           draftReport({ ...args, messages: processedMessages }),
//       },
//       checkMapLayersNames: {
//         description:
//           "Here are the the names of the current map layers. If you run a geospatial analysis, and you select a name for the layer, you should should first check the layer names to make sure the name you selected is not already in use. You shouldn't output any message regarding the name you select.",
//         parameters: z.object({
//           layerName: z
//             .string()
//             .describe("The name of the layer to be displayed."),
//           title: z
//             .string()
//             .optional()
//             .describe(
//               "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
//             ),
//         }),

//         execute: async (args) => {
//           return mapLayersNames;
//         },
//       },
//     },
//   });

//   return result.toDataStreamResponse();
// }


import { openai } from "@ai-sdk/openai";
// import { azure } from "@ai-sdk/azure"; // You can also use Azure's hosted GPT models. More info: https://sdk.vercel.ai/providers/ai-sdk-providers
import {
  type Message,
  type CoreUserMessage,
  streamText,
  convertToCoreMessages,
} from "ai";

import { z } from "zod";

import { NextResponse } from "next/server";

import {
  getChatById,
  saveChat,
  saveMessages,
  searchGeeDatasets,
} from "@/lib/database/chat/queries";
import {
  getUsageForUser,
  getUserRoleAndTier,
  incrementRequestCount,
} from "@/lib/database/usage";
import { getPermissionSet } from "@/lib/auth";
import {
  requestGeospatialAnalysis,
  requestLoadingGeospatialData,
  requestRagQuery,
  draftReport,
  requestWebScraping,
  requestWorldPopPopulationAnalysis,
  requestUrbanInfrastructureAnalysis,
  requestLandValueInvestmentAnalysis,
  requestFloodRiskDrainageAnalysis,
  requestGreenSpaceHeatIslandAnalysis,
  requestPublicTransportOptimizationAnalysis,
} from "@/lib/database/chat/tools";
import {
  generateUUID,
  sanitizeResponseMessages,
  getMostRecentUserMessage,
  generateTitleFromUserMessage,
  getFormattedDate,
} from "@/features/chat/utils/general-utils";

// ROI Debugging Helper Functions
function debugROI(label: string, roiData: any) {
  console.log(`🗺️ ROI DEBUG [${label}]:`, {
    exists: !!roiData,
    type: roiData?.type,
    hasCoordinates: !!roiData?.coordinates,
    coordinatesLength: roiData?.coordinates?.length,
    firstCoordinate: roiData?.coordinates?.[0]?.[0]?.[0],
    dataStructure: typeof roiData,
    fullData: JSON.stringify(roiData, null, 2)
  });
}

function calculateROIArea(roiData: any) {
  if (!roiData?.coordinates) return null;
  
  try {
    // Basic area calculation for debugging (simplified)
    const coords = roiData.coordinates[0];
    if (!coords || coords.length < 3) return null;
    
    // Simple bounding box area calculation (not accurate but good for debugging)
    const lats = coords.map((coord: any) => coord[1]);
    const lngs = coords.map((coord: any) => coord[0]);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const approximateArea = latRange * lngRange * 111 * 111; // Very rough km² estimate
    
    console.log(`📐 ROI Area Debug: ~${approximateArea.toFixed(2)} km²`);
    return approximateArea;
  } catch (error) {
    console.error('❌ ROI Area calculation error:', error);
    return null;
  }
}

// export const maxDuration = 30;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedRoiGeometryInChat,
    mapLayersNames,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
    selectedRoiGeometryInChat: any;
    mapLayersNames: string[];
  } = await request.json();

  // 🗺️ ROI DEBUG: Initial request data
  debugROI("REQUEST_RECEIVED", selectedRoiGeometryInChat);
  calculateROIArea(selectedRoiGeometryInChat);

  // Mock user ID for local testing - no authentication required
  const userId = "local-user-id";

  // Fetch the user's role + subscription
  const userRoleRecord = await getUserRoleAndTier(userId);
  if (!userRoleRecord) {
    return NextResponse.json(
      { error: "Failed to get role/subscription" },
      { status: 403 }
    );
  }

  const { role, subscription_tier: subscriptionTier } = userRoleRecord;
  const { maxRequests, maxArea } = await getPermissionSet(
    role as "ADMIN" | "USER" | "TRIAL",
    subscriptionTier as "Essentials" | "Pro" | "Enterprise"
  );
  
  // 🗺️ ROI DEBUG: Area limits
  console.log(`🔒 ROI Area Limit: ${maxArea} km²`);
  
  const usage = await getUsageForUser(userId);
  if (usage.requests_count >= maxRequests) {
    return NextResponse.json(
      { error: "Request limit exceeded" },
      { status: 403 }
    );
  }

  const cookieStore = request.headers.get("cookie");
  const chat = await getChatById(id);

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  // Increment usage count
  await incrementRequestCount(userId);

  if (!chat) {
    const generatedTitle = await generateTitleFromUserMessage({
      message: messages[0] as CoreUserMessage,
    });
    await saveChat({ id: id, title: generatedTitle });
  }

  const userMessageId = generateUUID();
  await saveMessages({
    messages: [
      {
        ...userMessage,
        id: userMessageId,
        createdAt: new Date(),
        chatId: id,
      },
    ],
  });

  // Enhanced system instructions with ROI awareness
  const roiStatus = selectedRoiGeometryInChat ? 
    `ROI STATUS: ✅ User has already provided a region of interest (ROI) on the map. The ROI geometry is available for analysis.` :
    `ROI STATUS: ❌ No region of interest (ROI) is currently selected on the map.`;
  
  const systemInstructions = `Today is ${getFormattedDate()}. You are an AI Assistant specializing in geospatial analytics. 
  Be kind, warm, and professional. Use emojis where appropriate to enhance user experience.
  
  ${roiStatus}
  
  CRITICAL INSTRUCTION: When user asks for ANY geospatial analysis (traffic, green space, infrastructure, etc.), you MUST immediately run the appropriate analysis tool WITHOUT asking for location details. The user has already provided their region of interest (ROI) by drawing/selecting it on the map interface.
  
  NEVER ask "Could you please provide the specific region or area you want to analyze?" - the ROI is already available. Just run the analysis directly.
  
  If the analysis tool returns an error about missing ROI, THEN and only then should you inform the user they need to select a region on the map.
  
  Always highlight important outputs and provide help in interpreting results. NEVER include map URLs or map legends/palette (like classes) in your responses.
  Refuse to answer questions irrelevant to geospatial analytics or the platform's context. You have access to several tools. If running a tool fails, and you thought you would be to fix it with a change, try 3 times until you fix it.
  IF USER ASKS FOR DRAFTING REPORTS, YOU SHOULD RUN THE "draftReport" TOOL, AND JUST CONFIRM THE DRAFTING OF THE REPORT. YOU SHOULD NOT EVER DRAFT REPORT IN THE CHAT.
  You also have access to a tool that can load geospatial data. First, run the tool that searches the database containing GEE datasets information to find the datasets best match user's request. Afterwards, run the web scraper tool to find extra info such as how to set the visualization parameter (pay attention to the code snippet from the official doc you will recieve). After that provide a short summary of what data with what parameters you're going to load to make sure if it's exactly what the user needs. After everything goes well and the user confirmed the details of the analysis to run, use all the information to load the dataset. 
  Another tool you have access to is a RAG query tool that you can use to answer questions you don't know the answer to.
  Before running any geospatial analysis, make sure the layer name doesn't already exist in the map layers. No geospatial analysis is available for the year 2025, so you SHOULD NOT run analysis for 2025 even if the user asks for it.
  When executing analyses (not ragQueryRetrieval, though):
  1. Always provide a clear summary of what was analyzed
  2. Highlight key findings and patterns in the data,
  3. Try to tabulate some parts of the results/descriptions for the sake of clarity.`;

  // Prepend system instructions to the conversation as a separate message for the AI
  const systemMessage = {
    role: "assistant", // Change role to "assistant" to avoid unhandled role errors
    content: systemInstructions,
  };

  // Add the system message at the beginning of the conversation
  const processedMessages = [
    systemMessage,
    ...messages.filter((msg: any) => msg.role !== "system"),
  ] as Array<Message>;

  const result = await streamText({
    model: openai("gpt-4o"),
    // model: azure("gpt-4o"),  // You can also use Azure's hosted GPT models
    maxSteps: 5,
    messages: convertToCoreMessages(processedMessages),
    onFinish: async ({ response }) => {
      if (userId) {
        try {
          const responseMessagesWithoutIncompleteToolCalls =
            sanitizeResponseMessages(response.messages);

          await saveMessages({
            messages: responseMessagesWithoutIncompleteToolCalls.map(
              (message) => {
                const messageId = generateUUID();

                return {
                  id: messageId,
                  chatId: id,
                  draftedReportId: null,
                  role: message.role,
                  content: message.content,
                  createdAt: new Date(),
                };
              }
            ),
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },

    tools: {
      requestGeospatialAnalysis: {
        description: `Today is ${getFormattedDate()}, so you should be able to help the user with requests by up to this date. No analysis should be done for the year of 2025 as analyses are not yet ready for the new year.
          After running an analysis: 1. Provide a clear summary of what was analyzed and why, 2. Explain the key findings and their significance. NEVER PROVIDE MAP URLs or MAP LEGENDS FROM THE ANALYSES IN THE RESPONSE. Also the maximum area the user can request analysis for is ${maxArea} sq km. per request.
          It should be noted that the land cover map (start date: 2015) and bi-temporal land cover change map (start date: 2015) are based on Sentinel-2 imagery, UHI (start date: 2015) is based on Landsat imagery. For all "CHANGE" maps, the user must provide "startDate2 and endDate2". If in doubt about an analysis (e.g., it may not exactly match the analysis we have), you have to double check with the user.`,
        parameters: z.object({
          functionType: z.string()
            .describe(`The type of analysis to execute. It can be one of the following:
            'Urban Heat Island (UHI) Analysis',
            'Land Use/Land Cover Maps',
            'Land Use/Land Cover Change Maps'.`),
          startDate1String: z
            .string()
            .describe(
              "The start date for the first period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          endDate1String: z
            .string()
            .describe(
              "The end date for the first period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          startDate2String: z
            .string()
            .optional()
            .describe(
              "The start date for the second period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          endDate2String: z
            .string()
            .optional()
            .describe(
              "The end date for the second period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          aggregationMethod: z.string().describe(
            `The method to use for aggregating the data. It means that in a time-series, what method is used to aggregate data for a given point/pixel in the final map/analysis delivered. For land use/land cover mapping, it's always "Median", and thus you don't need to ask user for that. It can be one of the following:
            'Mean',
            'Median',
            'Min',
            'Max',
            . Note that the user may not provide it, so by default its value should be 'Max', and you should not ask the user to tell you what method to use. If the default value is used, make sure to mention it in the response to user that your analysis is based on the maximum va.
          `
          ),
          layerName: z
            .string()
            .describe(
              "The name of the layer to be displayed. You ask the user about it if they don't provide it. Otherwise, use a name based on the function type, but make sure the name is concise and descriptive. "
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),
        execute: async (args) => {
          // 🗺️ ROI DEBUG: Before geospatial analysis
          debugROI("GEOSPATIAL_ANALYSIS_EXECUTE", selectedRoiGeometryInChat);
          console.log(`🔍 Analysis Type: ${args.functionType}`);
          console.log(`📅 Date Range: ${args.startDate1String} to ${args.endDate1String}`);
          
          const result = await requestGeospatialAnalysis({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
            maxArea,
          });
          
          // 🗺️ ROI DEBUG: After analysis result
          console.log(`✅ Geospatial Analysis Result Status:`, {
            success: !!result,
            hasError: result?.error ? true : false,
            resultKeys: result ? Object.keys(result) : [],
            errorMessage: result?.error || 'No error'
          });
          
          // 🚨 LOG THE ACTUAL ERROR MESSAGE
          if (result?.error) {
            console.error('🚨 GEOSPATIAL ANALYSIS ERROR:', result.error);
          }
          
          return result;
        },
      },
      requestLoadingGeospatialData: {
        description: `The user has requested loading and visualizing geospatial data. You should load the data based on the user's request.`,
        parameters: z.object({
          geospatialDataType: z.string().describe(
            `The type of geospatial data to load. It can be one of the following:
      'Load GEE Data'`
          ),
          selectedRoiGeometry: z
            .object({
              type: z.string().optional(),
              coordinates: z.array(z.array(z.array(z.number()))).optional(),
            })
            .optional()
            .describe(
              "The selected region of interest (ROI) geometry. You should run the analysis based on the user's request."
            ),
          dataType: z
            .string()
            .describe(
              `The type of data to load. It can be one of the following: 'Image', 'ImageCollection'.`
            ),

          divideValue: z
            .number()
            .describe(
              `The value to divide the image by. If based on the scraped data you didn't find it, use your logic to see if it should be set based on the dataset. Sometimes, the division is done within a "cloud mask" function, so you should extract its value from there in that case. If you decide not to set it, set it to 1.`
            ),
          datasetId: z.string().describe("The ID of the GEE dataset to load."),
          startDate: z
            .string()
            .describe(
              "The start date for the data to load. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          endDate: z
            .string()
            .describe(
              "The end date for the data to load. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          visParams: z.union([
            // single-band case
            z.object({
              bands: z.array(z.string()).length(1),
              palette: z.array(z.string()),
              min: z.number().optional(),
              max: z.number().optional(),
            }),
            // multi-band case
            z.object({
              bands: z.array(z.string()),
              min: z.number().optional(),
              max: z.number().optional(),
            }),
          ])
            .describe(`You should set the visualization parameters best matching user's request for the data to load and best way of visualization:
            1) If you want to combine more than one band for visualization, set visParams using the bands: [...] attribute.
            2) Otherwise, use the palette: [...] attribute (and do not include bands).
            As an example, RGB visualization should be set as: {bands: ['red', 'green', 'blue']}. Forest loss should be using pellete if it's one band.
      `),
          labelNames: z
            .array(z.string())
            .describe(
              "The label names for the data to load. You should run the analysis based on the user's request. Choose the closet label names even if it doesn't 100% match what you already know. Infer it."
            ),
          layerName: z
            .string()
            .describe(
              "The name of the layer to be displayed. You ask the user about it if they don't provide it. Otherwise, use a name based on the function type, but make sure the name is concise and descriptive. "
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),
        execute: async (args) => {
          // 🗺️ ROI DEBUG: Loading geospatial data
          debugROI("LOADING_GEOSPATIAL_DATA", selectedRoiGeometryInChat);
          debugROI("ARGS_SELECTED_ROI", args.selectedRoiGeometry);
          console.log(`📊 Dataset ID: ${args.datasetId}`);
          console.log(`📅 Date Range: ${args.startDate} to ${args.endDate}`);
          
          const result = await requestLoadingGeospatialData({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
          });
          
          // 🗺️ ROI DEBUG: After loading result
          console.log(`✅ Data Loading Result Status:`, {
            success: !!result,
            hasError: result?.error ? true : false,
            resultKeys: result ? Object.keys(result) : []
          });
          
          return result;
        },
      },
      searchGeeDatasets: {
        description: `Find the datasets available in Google Earth Engine (GEE) that best match the user's query.`,
        parameters: z.object({
          query: z.string().describe("The name of the dataset to search."),
          startDate: z
            .string()
            .optional()
            .describe(
              "The start date for the data to load based on the scraping results. This could be the year or the date in a format. This shows the start date the data is available."
            ),
          endDate: z
            .string()
            .optional()
            .describe(
              "The end date for the data to load based on the scraping result. This could be the year or the date in a format. This shows the end date the data is available."
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),
        execute: async (args) => {
          const result = searchGeeDatasets(args.query);
          return result;
        },
      },

      scrapeWebpage: {
        description:
          "Scrape the webpage of the GEE dataset to learn what dataset_id, how data is visualized, legends, any division by a value, etc. you should use for the the requested dataset. For example, one of the things you should learn is whether you need to have a band combination (e.g., [b1, b2, b3]) or a palette (e.g., ['red', 'green', 'blue']) to visualize the image.",
        parameters: z.object({
          url: z
            .string()
            .describe(
              "The asset URL of the webpage to scrape. The name of the column you're scraping for this parameter should be 'asset_url'."
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),

        execute: async (args) => {
          return requestWebScraping(args);
        },
      },
      requestRagQuery: {
        description: `The user has some documents with which a RAG has been built. If you're asked a question that you didn't know the answer, run the requestRagQuery tool that is based on user's documents to get the answer.`,
        parameters: z.object({
          query: z.string().describe("The user's query text."),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),
        execute: async (args) => requestRagQuery({ ...args, cookieStore }),
      },
      draftReport: {
        description: `When this tool is called, draft a report that summarizes the analyses and their results. The report should be concise and easy to understand, highlighting the key findings and insights. Markdown is supported.`,
        parameters: z.object({
          messages: z
            .array(z.object({}))
            .describe(
              "The messages exchanged between the user and the you. You should use relevant messages in the chat to generate the report the user requested. Make sure you format the report in a standard way with all the common structures."
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the report to be drafted in one sentence confirming you're working on the user's request."
            ),
          reportFileName: z
            .string()
            .optional()
            .describe("Provide a concise name for the report file."),
        }),
        execute: async (args) =>
          draftReport({ ...args, messages: processedMessages }),
      },
      checkMapLayersNames: {
        description:
          "Here are the the names of the current map layers. If you run a geospatial analysis, and you select a name for the layer, you should should first check the layer names to make sure the name you selected is not already in use. You shouldn't output any message regarding the name you select.",
        parameters: z.object({
          layerName: z
            .string()
            .describe("The name of the layer to be displayed."),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),

        execute: async (args) => {
          return mapLayersNames;
        },
      },
      requestWorldPopPopulationAnalysis: {
        description: `Analyze population data using WorldPop datasets for urban analysis. This tool provides high-resolution population data, density analysis, and population change over time. Available analysis types include:
          - Population Data: Get current population statistics for a specific year
          - Population Density: Analyze population density patterns
          - Population Change: Compare population changes between two time periods
          
          After running the analysis: 1. Provide a clear summary of what was analyzed and why, 2. Explain the key findings and their significance for urban planning, 3. Highlight any trends or patterns in population distribution.`,
        parameters: z.object({
          analysisType: z.string()
            .describe(`The type of population analysis to execute. It can be one of the following:
            'Population Data' - Get population statistics for a specific year
            'Population Density' - Analyze population density patterns
            'Population Change' - Compare population changes between two time periods`),
          country: z
            .string()
            .describe("The country for which to analyze population data. Use standard country names (e.g., 'United States', 'Germany', 'India')."),
          year1String: z
            .string()
            .describe(
              "The year for population analysis (for Population Data and Population Density) or the start year (for Population Change). The date format should be 'YYYY'. Convert any other date format the user gives you to that one."
            ),
          year2String: z
            .string()
            .optional()
            .describe(
              "The end year for population change analysis. Only required for 'Population Change' analysis type. The date format should be 'YYYY'. Convert any other date format the user gives you to that one."
            ),
          resolution: z
            .string()
            .optional()
            .describe(
              "The resolution of the population data. Can be '100m' or '1km'. Default is '100m' for higher precision."
            ),
          format: z
            .string()
            .optional()
            .describe(
              "The format of the output data. Can be 'json', 'csv', or 'geotiff'. Default is 'json'."
            ),
          layerName: z
            .string()
            .describe(
              "The name of the layer to be displayed. Ask the user about it if they don't provide it. Otherwise, use a name based on the analysis type, but make sure the name is concise and descriptive."
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the name you select."
            ),
        }),
        execute: async (args) => {
          // 🌍 ROI DEBUG: Before WorldPop population analysis
          debugROI("WORLDPOP_POPULATION_ANALYSIS_EXECUTE", selectedRoiGeometryInChat);
          console.log(`🌍 Analysis Type: ${args.analysisType}`);
          console.log(`🌍 Country: ${args.country}`);
          console.log(`📅 Year Range: ${args.year1String}${args.year2String ? ` to ${args.year2String}` : ''}`);
          
          const result = await requestWorldPopPopulationAnalysis({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
            maxArea,
          });
          
          // 🌍 ROI DEBUG: After WorldPop analysis result
          console.log(`✅ WorldPop Population Analysis Result Status:`, {
            success: !!result,
            hasError: result?.error ? true : false,
            resultKeys: result ? Object.keys(result) : [],
            errorMessage: result?.error || 'No error'
          });
          
          // 🚨 LOG THE ACTUAL ERROR MESSAGE
          if (result?.error) {
            console.error('🚨 WORLDPOP POPULATION ANALYSIS ERROR:', result.error);
          }
          
          return result;
        },
      },
      requestUrbanInfrastructureAnalysis: {
        description: `IMPORTANT: This tool automatically uses the user's selected ROI (Region of Interest) from the map. Do NOT ask for location - just run the analysis immediately.
        
        Analyze urban infrastructure needs and recommend specific infrastructure investments like flyovers, bridges, and road improvements. This tool provides actionable insights for:
          - Flyover and Bridge Requirements: Identify congestion points and recommend specific infrastructure solutions
          - Traffic Congestion Hotspots: Analyze traffic flow patterns and bottlenecks (now with REAL TomTom traffic data!)
          - Public Transport Accessibility: Assess gaps in public transportation coverage
          - Road Network Density: Evaluate connectivity and capacity of existing road networks
          - Infrastructure Gap Analysis: Identify missing or inadequate infrastructure components
          
          The analysis uses real-time traffic data from TomTom API, OpenStreetMap road networks, and weather data to provide specific recommendations including optimal locations, cost estimates, and expected impact.`,
        parameters: z.object({
          analysisType: z.string()
            .describe(`The type of infrastructure analysis to execute. It can be one of the following:
            'Flyover and Bridge Requirements' - Identify where flyovers/bridges are needed most
            'Traffic Congestion Hotspots' - Map and analyze traffic congestion patterns
            'Public Transport Accessibility' - Assess public transportation coverage gaps
            'Road Network Density' - Analyze road connectivity and capacity
            'Infrastructure Gap Analysis' - Comprehensive infrastructure needs assessment`),
          infrastructureType: z.string()
            .describe(`The type of infrastructure focus. Options include:
            'Roads and Highways' - Focus on road infrastructure and connectivity
            'Public Transportation' - Focus on buses, metro, and transit systems
            'Pedestrian Infrastructure' - Focus on walkways, crossings, and accessibility
            'Parking Facilities' - Focus on parking availability and management
            'Traffic Management Systems' - Focus on traffic signals and flow management`),
          trafficDataYear: z
            .string()
            .optional()
            .describe("The year for traffic data analysis. Format: 'YYYY'. Defaults to most recent available data."),
          populationDataYear: z
            .string()
            .optional()
            .describe("The year for population data analysis. Format: 'YYYY'. Defaults to most recent available data."),
          thresholds: z
            .object({
              congestionLevel: z.number().optional(),
              populationDensity: z.number().optional(),
              accessibilityRadius: z.number().optional(),
            })
            .optional()
            .describe("Custom thresholds for analysis. Congestion level (1-10), population density (people/km²), accessibility radius (km)."),
          layerName: z
            .string()
            .describe("The name of the layer to be displayed. Make it descriptive and related to the infrastructure analysis type."),
          title: z
            .string()
            .optional()
            .describe("Brief title describing the infrastructure analysis being performed."),
        }),
        execute: async (args) => {
          debugROI("URBAN_INFRASTRUCTURE_ANALYSIS", selectedRoiGeometryInChat);
          console.log(`🏗️ Infrastructure Analysis: ${args.analysisType} - ${args.infrastructureType}`);
          
          const result = await requestUrbanInfrastructureAnalysis({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
            maxArea,
          });
          
          console.log(`✅ Urban Infrastructure Analysis Result:`, {
            success: !!result,
            hasError: result?.error ? true : false,
            errorMessage: result?.error || 'No error'
          });
          
          if (result?.error) {
            console.error('🚨 URBAN INFRASTRUCTURE ANALYSIS ERROR:', result.error);
          }
          
          return result;
        },
      },
      requestLandValueInvestmentAnalysis: {
        description: `Analyze land value trends and investment opportunities to guide real estate and development decisions. This tool provides insights for:
          - Property Value Trends: Track historical and predict future property value changes
          - Investment Potential Mapping: Identify high-potential areas for property investment
          - Gentrification Risk Assessment: Analyze areas at risk of gentrification
          - Development Opportunity Analysis: Find optimal locations for new developments
          - Market Saturation Analysis: Assess market conditions and competition levels
          
          Uses satellite data, urban growth patterns, infrastructure development, and economic indicators to provide investment recommendations and risk assessments.`,
        parameters: z.object({
          analysisType: z.string()
            .describe(`The type of investment analysis to execute. Options:
            'Property Value Trends' - Analyze historical and projected property values
            'Investment Potential Mapping' - Identify high-potential investment areas
            'Gentrification Risk Assessment' - Analyze gentrification patterns and risks
            'Development Opportunity Analysis' - Find optimal development locations
            'Market Saturation Analysis' - Assess market conditions and competition`),
          investmentCategory: z.string()
            .optional()
            .describe(`Investment category focus:
            'Residential' - Houses, apartments, residential developments
            'Commercial' - Office buildings, retail spaces, commercial properties
            'Mixed-Use' - Combined residential and commercial developments
            'Industrial' - Manufacturing, warehouses, industrial properties
            'Infrastructure' - Transportation, utilities, public infrastructure`),
          timeframe: z.string()
            .optional()
            .describe(`Investment timeframe:
            'Short-term' - 1-3 years
            'Medium-term' - 3-7 years
            'Long-term' - 7+ years`),
          budgetRange: z.string()
            .optional()
            .describe(`Budget range for investment:
            'Low' - Under $1M
            'Medium' - $1M-$10M
            'High' - $10M-$100M
            'Premium' - $100M+`),
          developmentFactors: z
            .array(z.string())
            .optional()
            .describe(`Factors to consider in development analysis:
            'Transport Connectivity', 'Population Growth', 'Economic Development', 
            'Infrastructure Projects', 'Zoning Changes', 'Environmental Factors'`),
          layerName: z
            .string()
            .describe("The name of the layer to be displayed. Make it descriptive and related to the investment analysis."),
          title: z
            .string()
            .optional()
            .describe("Brief title describing the investment analysis being performed."),
        }),
        execute: async (args) => {
          debugROI("LAND_VALUE_INVESTMENT_ANALYSIS", selectedRoiGeometryInChat);
          console.log(`💰 Investment Analysis: ${args.analysisType} - ${args.investmentCategory || 'General'}`);
          
          const result = await requestLandValueInvestmentAnalysis({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
            maxArea,
          });
          
          console.log(`✅ Land Value Investment Analysis Result:`, {
            success: !!result,
            hasError: result?.error ? true : false,
            errorMessage: result?.error || 'No error'
          });
          
          if (result?.error) {
            console.error('🚨 LAND VALUE INVESTMENT ANALYSIS ERROR:', result.error);
          }
          
          return result;
        },
      },
      requestFloodRiskDrainageAnalysis: {
        description: `Analyze flood risk and drainage infrastructure to inform flood management and urban resilience planning. This tool provides:
          - Flood Risk Mapping: Identify areas prone to flooding and assess risk levels
          - Drainage System Assessment: Evaluate existing drainage capacity and performance
          - Stormwater Management: Plan for stormwater collection and management systems
          - Vulnerability Assessment: Assess infrastructure and population vulnerability to floods
          - Emergency Response Planning: Support evacuation route and emergency facility planning
          
          Uses elevation data, precipitation patterns, land cover, and hydrological modeling to provide comprehensive flood risk analysis.`,
        parameters: z.object({
          analysisType: z.string()
            .describe(`The type of flood risk analysis to execute. Options:
            'Flood Risk Mapping' - Map flood-prone areas and risk levels
            'Drainage System Assessment' - Evaluate drainage infrastructure capacity
            'Stormwater Management' - Plan stormwater collection and management
            'Vulnerability Assessment' - Assess flood vulnerability of infrastructure and population
            'Emergency Response Planning' - Plan evacuation routes and emergency facilities`),
          floodType: z.string()
            .optional()
            .describe(`Type of flood to analyze:
            'River Flooding' - Flooding from rivers and waterways
            'Urban Flooding' - Surface water flooding in urban areas
            'Coastal Flooding' - Sea level rise and storm surge flooding
            'Flash Flooding' - Rapid onset flooding from intense rainfall`),
          returnPeriod: z.string()
            .optional()
            .describe(`Flood return period for analysis:
            '10-year' - 1 in 10 year flood event
            '25-year' - 1 in 25 year flood event
            '50-year' - 1 in 50 year flood event
            '100-year' - 1 in 100 year flood event
            '500-year' - 1 in 500 year flood event`),
          vulnerabilityFactors: z
            .array(z.string())
            .optional()
            .describe(`Vulnerability factors to consider:
            'Population Density', 'Critical Infrastructure', 'Economic Assets', 
            'Environmental Sensitivity', 'Social Vulnerability', 'Historical Flooding'`),
          layerName: z
            .string()
            .describe("The name of the layer to be displayed. Make it descriptive and related to the flood risk analysis."),
          title: z
            .string()
            .optional()
            .describe("Brief title describing the flood risk analysis being performed."),
        }),
        execute: async (args) => {
          debugROI("FLOOD_RISK_DRAINAGE_ANALYSIS", selectedRoiGeometryInChat);
          console.log(`🌊 Flood Risk Analysis: ${args.analysisType} - ${args.floodType || 'General'}`);
          
          const result = await requestFloodRiskDrainageAnalysis({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
            maxArea,
          });
          
          console.log(`✅ Flood Risk Drainage Analysis Result:`, {
            success: !!result,
            hasError: result?.error ? true : false,
            errorMessage: result?.error || 'No error'
          });
          
          if (result?.error) {
            console.error('🚨 FLOOD RISK DRAINAGE ANALYSIS ERROR:', result.error);
          }
          
          return result;
        },
      },
      requestGreenSpaceHeatIslandAnalysis: {
        description: `Analyze green space coverage and urban heat islands to inform environmental planning and climate adaptation strategies. This tool provides:
          - Green Space Coverage Assessment: Map and quantify urban green space distribution
          - Urban Heat Island Mapping: Identify heat island hotspots and temperature variations
          - Tree Canopy Analysis: Assess tree coverage and canopy health
          - Heat Mitigation Planning: Recommend strategies to reduce urban heat
          - Vegetation Health Monitoring: Monitor the health and changes in urban vegetation
          
          Uses multispectral satellite imagery, land surface temperature data, and vegetation indices to provide comprehensive environmental analysis.`,
        parameters: z.object({
          analysisType: z.string()
            .describe(`The type of green space and heat analysis to execute. Options:
            'Green Space Coverage Assessment' - Map and quantify green space distribution
            'Urban Heat Island Mapping' - Identify heat island hotspots and patterns
            'Tree Canopy Analysis' - Assess tree coverage and canopy health
            'Heat Mitigation Planning' - Recommend heat reduction strategies
            'Vegetation Health Monitoring' - Monitor vegetation health and changes`),
          vegetationIndex: z.string()
            .optional()
            .describe(`Vegetation index to use for analysis:
            'NDVI' - Normalized Difference Vegetation Index (general vegetation)
            'EVI' - Enhanced Vegetation Index (improved accuracy)
            'SAVI' - Soil Adjusted Vegetation Index (for sparse vegetation)
            'NDWI' - Normalized Difference Water Index (water stress)`),
          seasonalComparison: z.string()
            .optional()
            .describe(`Seasonal comparison for analysis:
            'Summer vs Winter' - Compare hot and cold seasons
            'Wet vs Dry Season' - Compare rainy and dry periods
            'Annual Trend' - Analyze year-over-year changes
            'Monthly Variation' - Detailed monthly analysis`),
          heatMitigationStrategy: z.string()
            .optional()
            .describe(`Heat mitigation strategy focus:
            'Tree Planting' - Identify optimal locations for new trees
            'Green Roofs' - Assess potential for green roof installations
            'Urban Parks' - Plan for new park and green space development
            'Cool Pavements' - Identify areas for reflective pavement installation
            'Shade Structures' - Plan for artificial shade installations`),
          layerName: z
            .string()
            .describe("The name of the layer to be displayed. Make it descriptive and related to the green space analysis."),
          title: z
            .string()
            .optional()
            .describe("Brief title describing the green space and heat analysis being performed."),
        }),
        execute: async (args) => {
          debugROI("GREEN_SPACE_HEAT_ISLAND_ANALYSIS", selectedRoiGeometryInChat);
          console.log(`🌳 Green Space Analysis: ${args.analysisType} - ${args.vegetationIndex || 'NDVI'}`);
          
          const result = await requestGreenSpaceHeatIslandAnalysis({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
            maxArea,
          });
          
          console.log(`✅ Green Space Heat Island Analysis Result:`, {
            success: !!result,
            hasError: result?.error ? true : false,
            errorMessage: result?.error || 'No error'
          });
          
          if (result?.error) {
            console.error('🚨 GREEN SPACE HEAT ISLAND ANALYSIS ERROR:', result.error);
          }
          
          return result;
        },
      },
      requestPublicTransportOptimizationAnalysis: {
        description: `Analyze and optimize public transportation systems to improve accessibility, efficiency, and service coverage. This tool provides:
          - Transit Accessibility Analysis: Assess coverage and accessibility of public transport
          - Service Gap Identification: Identify areas with poor public transport access
          - Route Optimization: Recommend optimal routes and service improvements
          - Modal Connectivity Assessment: Analyze connections between different transport modes
          - Public Transport Demand Modeling: Model demand patterns and service needs
          
          Uses population density, land use patterns, existing transport networks, and mobility data to optimize public transportation planning.`,
        parameters: z.object({
          analysisType: z.string()
            .describe(`The type of public transport analysis to execute. Options:
            'Transit Accessibility Analysis' - Assess public transport coverage and accessibility
            'Service Gap Identification' - Identify areas with inadequate public transport
            'Route Optimization' - Recommend optimal routes and service improvements
            'Modal Connectivity Assessment' - Analyze connections between transport modes
            'Public Transport Demand Modeling' - Model demand patterns and service needs`),
          transportModes: z
            .array(z.string())
            .optional()
            .describe(`Transport modes to include in analysis:
            'Bus', 'Metro/Subway', 'Light Rail', 'Tram', 'Ferry', 'Cable Car', 'Bus Rapid Transit'`),
          accessibilityThreshold: z.string()
            .optional()
            .describe(`Walking distance threshold for accessibility:
            '400m' - 5-minute walk (standard for bus stops)
            '800m' - 10-minute walk (standard for rail stations)
            '1200m' - 15-minute walk (extended accessibility)
            '1600m' - 20-minute walk (maximum reasonable distance)`),
          serviceFrequency: z.string()
            .optional()
            .describe(`Service frequency standards:
            'High Frequency' - Every 5-10 minutes (urban core)
            'Medium Frequency' - Every 15-20 minutes (suburban areas)
            'Low Frequency' - Every 30-60 minutes (peripheral areas)
            'Peak Hours Only' - Service only during rush hours`),
          layerName: z
            .string()
            .describe("The name of the layer to be displayed. Make it descriptive and related to the transportation analysis."),
          title: z
            .string()
            .optional()
            .describe("Brief title describing the public transport optimization analysis being performed."),
        }),
        execute: async (args) => {
          debugROI("PUBLIC_TRANSPORT_OPTIMIZATION_ANALYSIS", selectedRoiGeometryInChat);
          console.log(`🚌 Transport Analysis: ${args.analysisType} - Modes: ${args.transportModes?.join(', ') || 'All'}`);
          
          const result = await requestPublicTransportOptimizationAnalysis({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
            maxArea,
          });
          
          console.log(`✅ Public Transport Optimization Analysis Result:`, {
            success: !!result,
            hasError: result?.error ? true : false,
            errorMessage: result?.error || 'No error'
          });
          
          if (result?.error) {
            console.error('🚨 PUBLIC TRANSPORT OPTIMIZATION ANALYSIS ERROR:', result.error);
          }
          
          return result;
        },
      },
    },
  });

  return result.toDataStreamResponse();
}