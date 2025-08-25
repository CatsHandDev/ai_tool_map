import React, { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { mindMapAtom } from '../store/mindMap';
import { db } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import '../styles/AddToolForm.scss';

// このフォームがどのカテゴリに属するかをpropsで受け取る
interface AddToolFormProps {
  category: string;
  onClose: () => void; // フォームを閉じるための関数
}

export const AddToolForm: React.FC<AddToolFormProps> = ({ category, onClose }) => {
  const user = useAtomValue(userAtom);
  const setMindMapData = useSetAtom(mindMapAtom);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('ログインしていません。');
      return;
    }
    if (!name || !url) {
      setError('ツール名とURLは必須です。');
      return;
    }

    const newTool = {
      id: name.toLowerCase().replace(/\s/g, ''), // 簡易的なIDを生成
      name,
      url,
      description,
      category, // propsで受け取ったカテゴリを設定
    };

    try {
      // Firestoreに新しいドキュメントを追加
      const userToolsCollectionRef = collection(db, 'users', user.uid, 'aiTools');
      const docRef = await addDoc(userToolsCollectionRef, newTool);

      console.log('新しいツールを追加しました:', docRef.id);

      // Jotaiの状態も更新して画面に即時反映
      setMindMapData((prevData) => {
        const newData = [...prevData];
        const categoryIndex = newData.findIndex((node) => node.category === category);
        if (categoryIndex !== -1) {
          // docIdも含めてツールを追加
          newData[categoryIndex].tools.push({ ...newTool, docId: docRef.id });
        }
        return newData;
      });

      onClose(); // 追加が成功したらフォームを閉じる
    } catch (err) {
      console.error('ツール追加エラー:', err);
      setError('ツールの追加に失敗しました。');
    }
  };

  return (
    <div className="add-tool-form-overlay">
      <div className="add-tool-form">
        <h3>{category}にツールを追加</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ツール名 (例: Notion AI)"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="簡単な説明"
          />
          {error && <p className="error-message">{error}</p>}
          <div className="button-group">
            <button type="button" onClick={onClose} className="secondary">
              キャンセル
            </button>
            <button type="submit">追加</button>
          </div>
        </form>
      </div>
    </div>
  );
};