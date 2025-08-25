import React, { useState } from 'react';
import '../styles/AddCategoryModal.scss';

interface AddCategoryModalProps {
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, onAddCategory }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError('カテゴリ名を入力してください。');
      return;
    }
    // 親コンポーネントに新しいカテゴリ名を渡す
    onAddCategory(categoryName.trim());
    // モーダルを閉じる
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-category-modal" onClick={(e) => e.stopPropagation()}>
        <h2>新しいカテゴリを追加</h2>
        <form onSubmit={handleSubmit}>
          <p>追加したいカテゴリの名前を入力してください。</p>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="例： デザインツール"
            autoFocus // モーダルが開いたら自動でフォーカスする
          />
          {error && <p className="error-message">{error}</p>}
          <div className="button-group">
            <button type="button" onClick={onClose} className="secondary-btn">
              キャンセル
            </button>
            <button type="submit" className="primary-btn">
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};