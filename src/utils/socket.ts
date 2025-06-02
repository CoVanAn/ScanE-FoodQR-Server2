/**
 * Utility functions for socket.io operations
 */

import { Server } from 'socket.io';

/**
 * Check how many clients are connected to a specific room
 * @param io The socket.io server instance
 * @param room The room name to check
 * @returns Promise with room information
 */
export async function getRoomInfo(io: Server, room: string) {
  try {
    // Get the set of Socket IDs in the room
    const sockets = await io.in(room).fetchSockets();
    
    return {
      count: sockets.length,
      room,
      socketIds: sockets.map(socket => socket.id)
    };
  } catch (error) {
    console.error(`Error getting room info for ${room}:`, error);
    return {
      count: 0,
      room,
      socketIds: [],
      error: (error as Error).message
    };
  }
}

/**
 * Emit debug information about socket rooms
 * @param io The socket.io server instance
 */
export async function debugSocketRooms(io: Server) {
  try {
    // Get all rooms (excluding per-socket rooms)
    const rooms = new Set<string>();
    const sockets = await io.fetchSockets();
    
    for (const socket of sockets) {
      for (const room of socket.rooms) {
        // Skip the socket's own room (which is named after the socket ID)
        if (room !== socket.id) {
          rooms.add(room);
        }
      }
    }
    
    // Get info for each room
    const roomsInfo = await Promise.all(
      Array.from(rooms).map(room => getRoomInfo(io, room))
    );
    
    console.log('Socket rooms info:', roomsInfo);
    console.log('Total connected sockets:', sockets.length);
    
    return {
      rooms: roomsInfo,
      totalConnections: sockets.length
    };
  } catch (error) {
    console.error('Error debugging socket rooms:', error);
    return { error: (error as Error).message };
  }
}
