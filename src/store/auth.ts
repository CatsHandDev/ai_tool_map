import { atom } from 'jotai';
import type { User } from 'firebase/auth';

// ユーザー情報の型は firebase/auth の User もしくは null
// 初期値は null (未ログイン)
export const userAtom = atom<User | null>(null);
export const authReadyAtom = atom<boolean>(false);
