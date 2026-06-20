export type DonationAlertPayload = {
  donation_id: string;
  nama_donatur: string;
  jumlah: number;
  pesan?: string | null;
  paid_at?: string;
  source?: 'payment' | 'overlay_test';
};
