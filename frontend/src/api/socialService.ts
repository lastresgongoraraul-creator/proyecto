import api from './axios';
import type { UserProfile, Review } from '../types';

export const followUser = async (userId: number): Promise<void> => {
  await api.post(`/social/follow/${userId}`);
};

export const unfollowUser = async (userId: number): Promise<void> => {
  await api.delete(`/social/unfollow/${userId}`);
};

export const fetchProfile = async (username: string): Promise<UserProfile> => {
  const response = await api.get(`/social/profile/${username}`);
  return response.data;
};

export const fetchActivity = async (): Promise<Review[]> => {
  const response = await api.get('/social/activity');
  return response.data;
};

export const likeReview = async (reviewId: number): Promise<void> => {
  await api.post(`/reviews/${reviewId}/like`);
};

export const unlikeReview = async (reviewId: number): Promise<void> => {
  await api.delete(`/reviews/${reviewId}/like`);
};

export const fetchConversations = async (): Promise<{ id: number; username: string }[]> => {
  const response = await api.get('/direct-messages/conversations');
  return response.data;
};

export const fetchDirectMessages = async (recipientUsername: string): Promise<any[]> => {
  const response = await api.get(`/direct-messages/${recipientUsername}`);
  return response.data;
};

export const sendDirectMessage = async (receiverId: number, content: string): Promise<void> => {
  await api.post('/direct-messages', { receiverId, content });
};

export const sendFriendRequest = async (userId: number): Promise<void> => {
  await api.post(`/social/friend-request/${userId}`);
};

export const acceptFriendRequest = async (requestId: number): Promise<void> => {
  await api.post(`/social/friend-request/${requestId}/accept`);
};

export const acceptFriendRequestByUserId = async (userId: number): Promise<void> => {
  await api.post(`/social/friend-request/accept-user/${userId}`);
};

export const rejectFriendRequest = async (requestId: number): Promise<void> => {
  await api.post(`/social/friend-request/${requestId}/reject`);
};

export const unfriend = async (friendId: number): Promise<void> => {
  await api.delete(`/social/unfriend/${friendId}`);
};

export const fetchFriends = async (): Promise<{ id: number; username: string; avatarUrl?: string }[]> => {
  const response = await api.get('/social/friends');
  return response.data;
};
