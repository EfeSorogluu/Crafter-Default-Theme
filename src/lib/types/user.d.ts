import { PERMISSIONS } from "../constants/permissions";
import { ChestItem } from "./chest";
import { Product } from "./product";
import { Role } from "./website";

export interface WallMessage {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    replies: WallMessage[];
    sender: WallMessageSender;
}

export interface WallMessageSender {
    id: string;
    username: string;
    role: Role;
}

export interface Message {
    id: string
    type: string
    targetId: string
    content: string
    createdAt: string
    updatedAt: string
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: {
        id: string;
        name: string;
        permissions: PERMISSIONS[];
        modificable: boolean;
        default?: boolean;
        color: string; // hex color
        createdAt: string;
        updatedAt: string;
    };
    balance: number;
    createdAt: string;
    updatedAt: string;
    chest: ChestItem[];
    wall: WallMessage[];
    messages: Message[];
    inventory?: any[];
    supportCount?: number;
    lastLogin?: string;
    socialLinks?: Record<string, string>;
    likes?: any[];
    comments?: any[];
    favorites?: any[];
    historyEvents?: any[];
    banned?: boolean;
    bannedBy?: {
        id: string;
        username: string;
        role: {
            id: string;
            name: string;
            color: string;
        };
    };
    bannedAt?: string;
    nextVoteAt?: string;
}

