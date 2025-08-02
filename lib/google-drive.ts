// Google Drive API integration
export interface DriveFile {
  id: string
  name: string
  size: string
  downloadUrl: string
  createdTime: string
}

export class GoogleDriveService {
  private accessToken: string | null = null

  constructor() {
    // В реальном приложении токен должен храниться безопасно
    this.accessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN || null
  }

  async uploadFile(file: File, fileName: string): Promise<DriveFile> {
    if (!this.accessToken) {
      throw new Error("Google Drive access token not configured")
    }

    const metadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || "root"],
    }

    const form = new FormData()
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }))
    form.append("file", file)

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    })

    if (!response.ok) {
      throw new Error("Failed to upload file to Google Drive")
    }

    const result = await response.json()

    // Получаем публичную ссылку
    await this.makeFilePublic(result.id)

    return {
      id: result.id,
      name: result.name,
      size: file.size.toString(),
      downloadUrl: `https://drive.google.com/uc?id=${result.id}&export=download`,
      createdTime: new Date().toISOString(),
    }
  }

  private async makeFilePublic(fileId: string): Promise<void> {
    if (!this.accessToken) return

    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    })
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error("Google Drive access token not configured")
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete file from Google Drive")
    }
  }

  async getFileInfo(fileId: string): Promise<DriveFile> {
    if (!this.accessToken) {
      throw new Error("Google Drive access token not configured")
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,size,createdTime`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to get file info from Google Drive")
    }

    const file = await response.json()

    return {
      id: file.id,
      name: file.name,
      size: file.size,
      downloadUrl: `https://drive.google.com/uc?id=${file.id}&export=download`,
      createdTime: file.createdTime,
    }
  }
}

export const driveService = new GoogleDriveService()
