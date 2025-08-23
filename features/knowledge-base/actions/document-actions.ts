"use server";
import {
  handlePdfFile,
  handleDocxFile,
  handleTextFile,
} from "@/utils/general/document-utils";
import { saveRagDocument } from "@/app/actions/rag-actions";

// Mock implementations for local testing without database

export async function fetchDocumentFiles(): Promise<DocumentFile[]> {
  // Return empty array for local testing
  console.log("Mock: Fetching document files");
  return [];
}

export async function fetchByDocumentName(
  fileName: string
): Promise<DocumentFile | null> {
  // Return null for local testing
  console.log(`Mock: Fetching document by name: ${fileName}`);
  return null;
}

export async function createDocument(formData: FormData): Promise<void> {
  const folderId = formData.get("folderId") as string | null;
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  console.log(`Mock: Creating document ${file.name}`);

  // Mock file processing
  let numberOfPages = 1;
  const fileType = file.type;

  if (fileType === "application/pdf") {
    const pages = await handlePdfFile(file);
    numberOfPages = typeof pages === 'string' ? parseInt(pages) || 1 : pages;
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const pages = await handleDocxFile(file);
    numberOfPages = typeof pages === 'string' ? parseInt(pages) || 1 : pages;
  } else if (fileType === "text/plain") {
    const pages = await handleTextFile(file);
    numberOfPages = typeof pages === 'string' ? parseInt(pages) || 1 : pages;
  } else {
    throw new Error("Unsupported file type");
  }

  // Mock save to RAG system
  await saveRagDocument(file, numberOfPages, folderId);
}

export async function deleteDocument(id: number): Promise<void> {
  console.log(`Mock: Deleting document ${id}`);
  // Mock implementation - no actual deletion in local mode
}

export async function fetchDocumentsFolders(): Promise<any[]> {
  // Return empty array for local testing
  console.log("Mock: Fetching document folders");
  return [];
}

export async function createDocumentFolder(
  folderName: string
): Promise<any> {
  console.log(`Mock: Creating document folder: ${folderName}`);
  
  // Return mock folder
  return {
    id: Date.now().toString(),
    name: folderName,
    created_at: new Date().toISOString(),
    owner: "local-user-id",
  };
}

export async function deleteDocumentFolder(folderId: string): Promise<void> {
  console.log(`Mock: Deleting document folder ${folderId}`);
  // Mock implementation - no actual deletion in local mode
}

export async function processAndUploadDocumentFile({
  file,
  folderId,
}: {
  file: File;
  folderId?: string | null;
}): Promise<{success: boolean, error?: string}> {
  console.log(`Mock: Processing and uploading document file ${file.name}`);
  
  // Mock file processing
  let numberOfPages = 1;
  const fileType = file.type;

  if (fileType === "application/pdf") {
    const pages = await handlePdfFile(file);
    numberOfPages = typeof pages === 'string' ? parseInt(pages) || 1 : pages;
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const pages = await handleDocxFile(file);
    numberOfPages = typeof pages === 'string' ? parseInt(pages) || 1 : pages;
  } else if (fileType === "text/plain") {
    const pages = await handleTextFile(file);
    numberOfPages = typeof pages === 'string' ? parseInt(pages) || 1 : pages;
  } else {
    throw new Error("Unsupported file type");
  }

  // Mock save to RAG system
  await saveRagDocument(file, numberOfPages, folderId || null);
  
  return { success: true };
}

export async function deleteDocumentFile(id: number): Promise<{success: boolean, message: string}> {
  console.log(`Mock: Deleting document file ${id}`);
  // Mock implementation - no actual deletion in local mode
  return { success: true, message: "Document deleted successfully (mock)" };
}