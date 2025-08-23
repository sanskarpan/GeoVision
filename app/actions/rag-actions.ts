"use server";

// Simplified RAG actions for local testing without database

export async function saveRagDocument(
  file: any,
  numberOfPages: number,
  folderId: string | null
) {
  // Mock implementation - no actual saving in local mode
  console.log(`Mock: Saving RAG document ${file.name} with ${numberOfPages} pages`);
  
  // Return mock file data
  return {
    id: Date.now(),
    name: file.name,
    owner: "local-user-id",
    number_of_pages: numberOfPages,
    file_path: `mock-path/${file.name}`,
    folder_id: folderId,
    created_at: new Date().toISOString(),
  };
}

export async function answerQuery(query: string, userEmail?: string) {
  // Mock implementation - return a simple response about local mode
  console.log(`Mock: Answering RAG query: ${query}`);
  
  return {
    answer: "I'm running in local mode without access to your knowledge base documents. To use the RAG (Retrieval-Augmented Generation) feature, you would need to set up a database and upload documents to your knowledge base.",
    citations: [],
    sources: [],
  };
}