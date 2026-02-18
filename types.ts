// ============================================================
// 宠物相关类型
// ============================================================
export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  distance: string;
  gender: 'male' | 'female';
  imageUrl: string;
  price?: number;
  location?: string;
  weight?: string;
  description?: string;
  tags?: string[];
  fosterParent?: {
    name: string;
    avatar: string;
  };
  isUrgent?: boolean;
  story?: string;
  health?: {
    vaccines: string;
    neuter: string;
    chip: string;
    training: string;
  };
  category?: 'all' | 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
  status?: 'available' | 'adopted' | 'pending';
}

// ============================================================
// 消息相关类型
// ============================================================
export interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  unreadCount?: number;
  isSystem?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  isSelf: boolean;
  createdAt: string;
}

// ============================================================
// 用户相关类型
// ============================================================
export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl: string;
  bio?: string;
  city?: string;
  followingCount: number;
  applyingCount: number;
  adoptedCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 领养申请类型
// ============================================================
export interface AdoptionApplication {
  id: string;
  userId: string;
  petId: string;
  fullName: string;
  age: string;
  occupation: string;
  housingType: string;
  livingStatus: string;
  hasExperience: boolean;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// ============================================================
// 实名认证类型
// ============================================================
export interface Verification {
  id: string;
  userId: string;
  realName: string;
  idType: string;
  idNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 会话类型
// ============================================================
export interface Conversation {
  id: string;
  userId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isSystem: boolean;
  createdAt: string;
}
