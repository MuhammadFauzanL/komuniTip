import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DonationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DonationGateway.name);

  // Menyimpan mapping { socketId: username }
  private activeClients = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.activeClients.delete(client.id);
  }

  // Streamer (OBS) mendengarkan berdasarkan username mereka
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, username: string) {
    if (username) {
      client.join(username);
      this.activeClients.set(client.id, username);
      this.logger.log(`Client ${client.id} joined room: ${username}`);
      return { status: 'Success', room: username };
    }
  }

  // Dipanggil dari PaymentService setelah webhook SUCCESS
  emitDonationAlert(username: string, donationData: any) {
    this.logger.log(`📢 Emitting new_donation to room: ${username}`);
    this.server.to(username).emit('new_donation', donationData);
  }
}
