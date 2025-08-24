import React, { useState, useEffect } from "react";
import { ChartStatsDisplay } from "@/features/charts/components/charts-display";
import CitationBadge from "./knowledge-base-citation/citation-badge";
import DisplayInChatAnalysisMapBtn from "./display-in-chat-analysis-map/display-in-chat-analysis-map-btn";
import DraftedReportBtn from "./draft-report/drafted-report-btn";
import WorldPopPopulationAnalysis from "./worldpop-population-analysis/worldpop-population-analysis";
import { validateToolCallingResults } from "@/features/chat/utils/tool-calling-results-validation";
import { Separator } from "@/components/ui/separator";

interface ToolCallingResultsProps {
  messageId: string;
  messageResults: ToolCallingMessageResults;
}

const ToolCallingResults = React.memo(
  ({ messageId, messageResults }: ToolCallingResultsProps) => {
    const messageDraftedReport = messageResults?.draftedReport;
    const messageCitationSources = messageResults?.citationSources;
    const reportFileName = messageResults?.reportFileName;

    const geospatialAnalysis = messageResults?.geospatialAnalysis;

    const geospatialData = messageResults?.geospatialData;

    const worldPopPopulationAnalysis = messageResults?.worldPopPopulationAnalysis;

    const validationResults = validateToolCallingResults(messageResults);

    if (!Object.values(validationResults).some((isValid) => isValid)) {
      return null;
    }

    return (
      <div className="flex flex-col gap-5 mb-10">
        {geospatialAnalysis && validationResults.geospatialAnalysis && (
          <div className="flex flex-col h-full gap-8 justify-center items-center">
            <div className="flex justify-center items-center h-[350px] w-[75%]">
              <ChartStatsDisplay
                functionType={geospatialAnalysis.functionType || ""}
                mapStats={geospatialAnalysis.mapStats || []}
                layerName={geospatialAnalysis.layerName || ""}
                legendConfig={geospatialAnalysis.legendConfig}
              />
            </div>
            <div className="w-full flex justify-start ml-20">
              <DisplayInChatAnalysisMapBtn
                analysisLayerName={geospatialAnalysis.layerName || ""}
              />
            </div>
          </div>
        )}

        {geospatialData && validationResults.geospatialData && (
          <div className="flex flex-col h-full gap-8 justify-center items-center">
            <div className="w-full flex justify-start ml-20">
              <DisplayInChatAnalysisMapBtn
                analysisLayerName={geospatialData.layerName || ""}
              />
            </div>
          </div>
        )}

        {messageDraftedReport && validationResults.draftedReport && (
          <div className="w-full flex justify-start ml-10">
            <DraftedReportBtn
              report={messageDraftedReport}
              reportFileName={reportFileName || ""}
            />
          </div>
        )}
        {messageCitationSources && validationResults.citationSources && (
          <div className="flex flex-col gap-4 ml-10">
            <Separator />
            <p className="font-semibold">References:</p>
            <CitationBadge
              citations={messageCitationSources}
              citationSource="uploadedDocument"
            />
          </div>
        )}

        {worldPopPopulationAnalysis && (
          <div className="flex flex-col h-full gap-8 justify-center items-center">
            <WorldPopPopulationAnalysis
              analysisType={worldPopPopulationAnalysis.analysisType}
              country={worldPopPopulationAnalysis.country}
              year1={worldPopPopulationAnalysis.year1}
              year2={worldPopPopulationAnalysis.year2}
              resolution={worldPopPopulationAnalysis.resolution}
              format={worldPopPopulationAnalysis.format}
              data={worldPopPopulationAnalysis.data}
              metadata={worldPopPopulationAnalysis.metadata}
            />
          </div>
        )}
      </div>
    );
  }
);

export default ToolCallingResults;
