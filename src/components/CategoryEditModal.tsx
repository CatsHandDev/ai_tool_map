import React, { useState, useMemo, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai'; // ★ useAtom をインポート
import { userAtom } from '../store/auth';
import { mindMapAtom } from '../store/mindMap';
import { db } from '../firebase/firebase';
import { collection, addDoc, deleteDoc, writeBatch, doc } from 'firebase/firestore';
import type { MindMapNode, AiTool } from '../data/initialMindMapData';
import '../styles/CategoryEditModal.scss';

interface CategoryEditModalProps {
  // 表示すべきカテゴリ名をpropsで受け取るように変更
  categoryName: string;
  onClose: () => void;
}

export const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ categoryName, onClose }) => {
  const user = useAtomValue(userAtom);
  // ★ setMindMapDataだけでなく、mindMapDataも直接購読する
  const [mindMapData, setMindMapData] = useAtom(mindMapAtom);

  // ★ JotaiのmindMapDataから、表示対象の最新のカテゴリ情報をリアルタイムで探し出す
  const currentNode = useMemo(
    () => mindMapData.find((n) => n.category === categoryName),
    [mindMapData, categoryName] // mindMapDataかcategoryNameが変わるたびに再計算
  );

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // ツール追加処理
  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 関数の先頭で currentNode の存在をチェック (型ガード)
    if (!user || !currentNode) {
      setError("カテゴリ情報が見つからないため、追加できません。");
      return;
    }

    // 2. このチェックを通過した安全な値を、新しい変数に格納する
    const targetCategoryName = currentNode.category;

    if (!name || !url) {
      setError('ツール名とURLは必須です。');
      return;
    }

    const newTool = {
      id: name.toLowerCase().replace(/\s/g, ''),
      name,
      url,
      description,
      category: targetCategoryName, // 3. 安全な変数を使用
    };

    try {
      const userToolsCollectionRef = collection(db, 'users', user.uid, 'aiTools');
      const docRef = await addDoc(userToolsCollectionRef, newTool);

      setMindMapData((prev) =>
        prev.map((n) =>
          // 4. コールバック関数の中でも安全な変数で比較
          n.category === targetCategoryName
            ? { ...n, tools: [...n.tools, { ...newTool, docId: docRef.id }] }
            : n
        )
      );
      // フォームをリセット
      setName(''); setUrl(''); setDescription(''); setError('');
    } catch (err) {
      setError('ツールの追加に失敗しました。');
      console.error(err);
    }
  };

  // ツール削除処理
  const handleDeleteTool = async (toolToDelete: AiTool) => {
    if (!user || !toolToDelete.docId || !currentNode) return;
    if (!window.confirm(`「${toolToDelete.name}」を削除しますか？`)) return;

    try {
      const toolDocRef = doc(db, 'users', user.uid, 'aiTools', toolToDelete.docId);
      await deleteDoc(toolDocRef);

      setMindMapData((currentMindMap) => {
        const newMindMap = JSON.parse(JSON.stringify(currentMindMap));
        const categoryIndex = newMindMap.findIndex(
          (n: MindMapNode) => n.category === currentNode.category
        );
        if (categoryIndex === -1) return currentMindMap;

        newMindMap[categoryIndex].tools = newMindMap[categoryIndex].tools.filter(
          (t: AiTool) => t.docId !== toolToDelete.docId
        );

        if (newMindMap[categoryIndex].tools.length === 0) {
          return newMindMap.filter(
            (n: MindMapNode) => n.category !== currentNode.category
          );
        }
        return newMindMap;
      });

    } catch (err) {
      alert('ツールの削除に失敗しました。');
      console.error(err);
    }
  };

  // ★★★ カテゴリ自体を削除する新しい関数 ★★★
  const handleDeleteCategory = async () => {
    if (!user || !currentNode) return;

    // ユーザーに最終確認
    const isConfirmed = window.confirm(
      `カテゴリ「${currentNode.category}」を削除しますか？\nこの操作は元に戻せません。`
    );

    // 「いいえ」(キャンセル)が押された場合は、ここで処理を中断
    if (!isConfirmed) {
      return;
    }

    try {
      // 1. Firestoreから関連するツールをすべて削除 (バッチ処理)
      const batch = writeBatch(db);
      currentNode.tools.forEach(tool => {
        if (tool.docId) {
          const toolDocRef = doc(db, 'users', user.uid, 'aiTools', tool.docId);
          batch.delete(toolDocRef);
        }
      });
      await batch.commit();
      console.log(`Firestoreからカテゴリ「${currentNode.category}」の全ツールを削除しました。`);

      // 2. Jotaiのローカル状態を更新
      setMindMapData(prevData =>
        prevData.filter(node => node.category !== currentNode.category)
      );

      // 3. モーダルを閉じる
      onClose();

    } catch (err) {
      alert("カテゴリの削除中にエラーが発生しました。");
      console.error("カテゴリ削除エラー:", err);
    }
  };

  // ★ currentNodeが存在しない場合（カテゴリが削除された場合など）はモーダルを閉じる
  useEffect(() => {
    if (!currentNode) {
      onClose();
    }
  }, [currentNode, onClose]);

  // ★ まだcurrentNodeが見つからない（レンダリングの過渡期）場合は何も表示しない
  if (!currentNode) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>「{currentNode.category}」ツールの管理</h2>

        <div className="tool-list">
          {currentNode.tools.length > 0 ? (
            currentNode.tools.map((tool) => (
              <div key={tool.docId || tool.id} className="tool-item">
                <a href={tool.url} target="_blank" rel="noopener noreferrer">{tool.name}</a>
                <button onClick={() => handleDeleteTool(tool)} className="delete-tool-btn">削除</button>
              </div>
            ))
          ) : (
            <p className="no-tools-message">このカテゴリにはツールがありません。</p>
          )}
        </div>

        <hr />

        {/* ★★★ ここからが復活させるフォーム部分 ★★★ */}
        <h3>新しいツールを追加</h3>
        <form onSubmit={handleAddTool} className="add-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ツール名 *"
            required // HTML5のバリデーションを追加
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL *"
            required // HTML5のバリデーションを追加
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="簡単な説明"
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="add-tool-btn">追加する</button>
        </form>

        {/* ★★★ モーダルのフッターと削除ボタンを追加 ★★★ */}
        <div className="modal-footer">
          <button onClick={handleDeleteCategory} className="delete-category-btn">
            このカテゴリを削除
          </button>
        </div>
      </div>
    </div>
  );
};