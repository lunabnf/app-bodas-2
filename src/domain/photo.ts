export interface GuestPhoto {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedByName: string;
  uploadedByToken?: string;
  createdAt: number;
}
