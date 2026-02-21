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
  category?: 'all' | 'dog' | 'cat' | 'rabbit' | 'bird' | 'hamster' | 'turtle' | 'fish' | 'other';
  status?: 'available' | 'adopted' | 'pending' | 'pending_review';
  userId?: string | null;
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
  senderId?: string | null;
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

export type AdoptionMilestoneStage = 'chatting' | 'meet' | 'trial' | 'adopted';
export type AdoptionMilestoneStatus = 'pending' | 'confirmed';

export interface AdoptionMilestone {
  id: string;
  applicationId: string;
  petId: string;
  adopterId: string;
  ownerId: string;
  stage: AdoptionMilestoneStage;
  status: AdoptionMilestoneStatus;
  confirmedByAdopter: boolean;
  confirmedByOwner: boolean;
  note?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 实名认证类型
// ============================================================
export interface Verification {
  id: string;
  userId: string;
  realName: string;
  idType: string;
  idNumber?: string | null;
  idNumberHash?: string | null;
  idNumberLast4?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 会话类型
// ============================================================
export type AgentType = 'pet_expert' | 'emotional_counselor';

export interface Conversation {
  id: string;
  userId: string;
  otherUserId?: string | null;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isSystem: boolean;
  agentType?: AgentType | null;
  createdAt: string;
}

// ============================================================
// 回收站类型
// ============================================================
export interface TrashedGroup {
  conversation: Conversation;
  messageCount: number;
  trashedAt: string;
  expiresAt: string;
}

// ============================================================
// 举报类型
// ============================================================
export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'pet' | 'message';
  targetId: string;
  reason: string;
  detail?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

// ============================================================
// 宠物成长日志
// ============================================================
export interface PetLog {
  id: string;
  petId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

// ============================================================
// 领养后回访任务
// ============================================================
export interface FollowUpTask {
  id: string;
  userId: string;
  petId: string;
  title: string;
  templateKey?: string | null;
  dueDate: string;
  status: 'pending' | 'completed';
  feedback?: string;
  completedAt?: string | null;
  createdAt: string;
}

// ============================================================
// Phase 4: 救助协作任务板
// ============================================================
export type RescueTaskType = 'feeding' | 'medical' | 'transport' | 'foster' | 'supplies';
export type RescueTaskStatus = 'open' | 'claimed' | 'completed' | 'cancelled';

export interface RescueTask {
  id: string;
  creatorId: string;
  title: string;
  taskType: RescueTaskType;
  description?: string | null;
  locationText?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  windowStart: string;
  windowEnd: string;
  status: RescueTaskStatus;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assignees: Array<{ userId: string; nickname: string; status: 'approved' | 'completed' }>;
  pendingApplicants: Array<{ userId: string; nickname: string }>;
  maxAssignees: number;
  claimedCount: number;
  claimedByMe: boolean;
  appliedByMe: boolean;
  completedNote?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRescueTaskParams {
  title: string;
  taskType: RescueTaskType;
  description?: string;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  windowStart: string;
  windowEnd: string;
  maxAssignees: number;
}

// ============================================================
// Phase 1: 失踪宠物应急广播
// ============================================================
export type LostAlertStatus = 'active' | 'closed';
export type LostPetGender = 'male' | 'female' | 'unknown';

export interface LostPetAlert {
  id: string;
  userId: string;
  petName: string;
  petType: string;
  petBreed?: string | null;
  petColor?: string | null;
  petGender?: LostPetGender | null;
  petAgeText?: string | null;
  avatarUrl?: string | null;
  description: string;
  lostAt: string;
  lastSeenAt?: string | null;
  locationText?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm: number;
  rewardText?: string | null;
  contactNote?: string | null;
  status: LostAlertStatus;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
}

export interface LostPetSighting {
  id: string;
  alertId: string;
  reporterId: string;
  sightingNote: string;
  locationText?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  sightedAt: string;
  contactHint?: string | null;
  createdAt: string;
}

export interface CreateLostAlertParams {
  petName: string;
  petType: string;
  petBreed?: string;
  petColor?: string;
  petGender?: LostPetGender;
  petAgeText?: string;
  avatarUrl?: string;
  description: string;
  lostAt: string;
  lastSeenAt?: string;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  rewardText?: string;
  contactNote?: string;
  isUrgent: boolean;
}

export interface SubmitSightingParams {
  alertId: string;
  sightingNote: string;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  sightedAt: string;
  contactHint?: string;
}

// ============================================================
// Phase 2: AI 领养匹配评分
// ============================================================
export type AllergyRiskLevel = 'low' | 'medium' | 'high';

export interface AdoptionMatchScore {
  id: string;
  userId: string;
  petId: string;
  applicationId?: string | null;
  overallScore: number;
  stabilityScore: number;
  timeScore: number;
  costScore: number;
  experienceScore: number;
  allergyRiskLevel: AllergyRiskLevel;
  summary: string;
  riskNotes?: string | null;
  suggestions?: string | null;
  rawPayload?: Record<string, unknown> | null;
  createdAt: string;
}

/** 匹配问卷填写内容 */
export interface MatchQuestionnaire {
  housingType: string;       // 住房情况
  livingStatus: string;      // 居住状态
  hasExperience: boolean;    // 养宠经验
  homeSize: string;          // 住宅面积（'<50㎡' | '50-100㎡' | '>100㎡'）
  dailyFreeHours: number;    // 每天可陪伴小时数
  monthlyBudget: string;     // 每月预算（'<500' | '500-1000' | '>1000'）
  hasAllergy: boolean;       // 是否有过敏史
  hasOtherPets: boolean;     // 是否有其他宠物
  workStyle: string;         // 工作方式（'远程' | '通勤' | '不规律'）
  message: string;           // 申请寄语
}

/** AI 原始输出结构 */
export interface MatchScoreRaw {
  overall_score: number;
  stability_score: number;
  time_score: number;
  cost_score: number;
  experience_score: number;
  allergy_risk_level: AllergyRiskLevel;
  summary: string;
  risk_notes: string;
  suggestions: string;
}

// ============================================================
// Phase 5: 宠物情绪与健康日记
// ============================================================
export interface PetHealthDiary {
  id: string;
  petId: string;
  authorId: string;
  moodLevel?: number | null;      // 1-5
  appetiteLevel?: number | null;  // 1-5
  energyLevel?: number | null;    // 1-5
  sleepHours?: number | null;
  weightKg?: number | null;
  symptoms?: string | null;
  note?: string | null;
  imageUrl?: string | null;
  recordedAt: string;
  createdAt: string;
}

export type HealthRiskLevel = 'low' | 'medium' | 'high';

export interface PetHealthInsight {
  id: string;
  petId: string;
  userId: string;
  periodDays: number;
  insightSummary: string;
  riskLevel: HealthRiskLevel;
  signals: string[];
  suggestions: string[];
  rawPayload?: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateHealthDiaryParams {
  petId: string;
  moodLevel?: number;
  appetiteLevel?: number;
  energyLevel?: number;
  sleepHours?: number;
  weightKg?: number;
  symptoms?: string;
  note?: string;
  imageUrl?: string;
  recordedAt?: string;
}

// ============================================================
// 主题和配色相关类型
// ============================================================
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'cyan';

export interface ColorPalette {
  primary: string;
  primaryDark: string;
  backgroundLight: string;
  surfaceWhite: string;
  textMain: string;
  textSub: string;
  bgDark: string;
  surfaceDark: string;
  borderDark: string;
}

export interface ColorSchemeConfig {
  light: ColorPalette;
  dark: ColorPalette;
}

export interface ThemeState {
  mode: ThemeMode;
  colorScheme: ColorScheme;
}
