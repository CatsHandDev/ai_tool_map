import { atom } from 'jotai';
import { type MindMapNode, initialData } from '../data/initialMindMapData';

// マインドマップのデータを保持するAtom
// 初期値はデフォルトのデータ
export const mindMapAtom = atom<MindMapNode[]>(initialData);

// データ読み込み中かどうかを示すローディング状態のAtom
export const mindMapLoadingAtom = atom<boolean>(true);