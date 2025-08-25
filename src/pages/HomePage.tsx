import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { mindMapAtom, mindMapLoadingAtom } from '../store/mindMap';
import { userAtom, authReadyAtom } from '../store/auth';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { type MindMapNode, initialData, type AiTool } from '../data/initialMindMapData';
import { CategoryEditModal } from '../components/CategoryEditModal';
import { AddCategoryModal } from '../components/AddCategoryModal';
import AddIcon from '@mui/icons-material/Add';

export const HomePage = () => {
  const [mindMapData, setMindMapData] = useAtom(mindMapAtom);
  const [isLoading, setIsLoading] = useAtom(mindMapLoadingAtom);
  const user = useAtomValue(userAtom);
  const authReady = useAtomValue(authReadyAtom);

  // モーダル表示のための状態管理
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // ログイン状態に応じてデータを取得するロジック
  useEffect(() => {
    // authReadyがfalseの間は、何もしない（AuthGuardがローディング表示中）
    if (!authReady) {
      return;
    }

    const fetchMindMapData = async () => {
      if (user) {
        setIsLoading(true);
        try{
          const userToolsCollectionRef = collection(db, 'users', user.uid, 'aiTools');
          const querySnapshot = await getDocs(userToolsCollectionRef);

          if (querySnapshot.empty) {
            console.log('初回ログイン：初期データをFirestoreにコピーします。');
            const batch = writeBatch(db);
            initialData.forEach(node => {
              node.tools.forEach(tool => {
                const toolDocRef = doc(collection(db, 'users', user.uid, 'aiTools'));
                batch.set(toolDocRef, { ...tool, category: node.category });
              });
            });
            await batch.commit();
            const newSnapshot = await getDocs(userToolsCollectionRef);
            const toolsFromFirestore: (AiTool & { category: string, docId: string })[] = [];
            newSnapshot.forEach((doc) => {
              const data = doc.data();
              toolsFromFirestore.push({
                id: data.id,
                name: data.name,
                url: data.url,
                description: data.description,
                category: data.category,
                docId: doc.id,
              });
            });
            const formattedData = formatData(toolsFromFirestore);
            setMindMapData(formattedData);
          } else {
            console.log('Firestoreからデータを取得しました。');
            const toolsFromFirestore: (AiTool & { category: string, docId: string })[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              toolsFromFirestore.push({
                id: data.id,
                name: data.name,
                url: data.url,
                description: data.description,
                category: data.category,
                docId: doc.id,
              });
            });
            const formattedData = formatData(toolsFromFirestore);
            setMindMapData(formattedData);
          }
        } catch (error) {
          console.error("Firestore Error:", error);
        } finally {
          setIsLoading(false);
        }      }
      else {
        setMindMapData(initialData);
        setIsLoading(false);
      }
    };

    const formatData = (tools: (AiTool & { category: string, docId: string })[]): MindMapNode[] => {
      const formatted: MindMapNode[] = [];
      const categories = [...new Set(tools.map(t => t.category))];
      categories.forEach(category => {
        const toolsForCategory = tools.filter(t => t.category === category);
        formatted.push({
          category: category,
          tools: toolsForCategory,
        });
      });
      return formatted;
    }

    fetchMindMapData();
  }, [user, setMindMapData, setIsLoading, authReady]);

  if (isLoading && user) {
    return <div className="loading">データを読み込んでいます...</div>;
  }

    // ★★★ 新しいカテゴリを追加する関数 ★★★
  const handleAddCategory = (newCategoryName: string) => {
    // すでに同じ名前のカテゴリが存在するかチェック
    const isExisting = mindMapData.some(node => node.category.toLowerCase() === newCategoryName.toLowerCase());
    if (isExisting) {
      alert(`「${newCategoryName}」というカテゴリは既に存在します。`);
      return;
    }

    // Jotaiの状態を更新
    const newCategory: MindMapNode = {
      category: newCategoryName,
      tools: [], // 最初はツールが空の状態で追加
    };
    setMindMapData(prevData => [...prevData, newCategory]);

    // NOTE: カテゴリは、ツールが1つ以上追加された時点で初めてFirebaseに実質的に保存されます。
    // この時点ではローカルの状態が更新されるだけです。
  };

  const numBranches = mindMapData.length;
  let rightBranches: MindMapNode[] = [];
  let leftBranches: MindMapNode[] = [];

  if (numBranches <= 3) {
    // 3個以下の場合はすべて右側
    rightBranches = mindMapData;
  } else {
    // 4個以上の場合は計算で振り分け
    const numRight = Math.ceil(numBranches / 2);
    rightBranches = mindMapData.slice(0, numRight);
    leftBranches = mindMapData.slice(numRight);
  }

  // ブランチの中身をレンダリングする共通コンポーネント
  const BranchContent = ({ node }: { node: MindMapNode }) => (
    <>
      <button
        type="button"
        className="category-node"
        onClick={() => user && setEditingCategoryName(node.category)}
        aria-label={`カテゴリ「${node.category}」を編集する`}
      >
        {node.category}
      </button>
      <div className="tool-nodes">
        {node.tools.map((tool) => (
          <div className="tool-node-wrapper" key={tool.docId || tool.id}>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="tool-node">
              {tool.name}
            </a>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {editingCategoryName && (
        <CategoryEditModal
          categoryName={editingCategoryName}
          onClose={() => setEditingCategoryName(null)}
        />
      )}

      {/* ★ カテゴリ追加モーダルのレンダリングロジック */}
      {isAddCategoryModalOpen && (
        <AddCategoryModal
          onClose={() => setIsAddCategoryModalOpen(false)}
          onAddCategory={handleAddCategory}
        />
      )}

      <div className="mindmap-container">
        <div className="mindmap-grid-container">
          {/* --- 左カラム --- */}
          <div className="branch-column column-left">
            {leftBranches.map((node) => (
              <div className="branch" key={node.category}>
                <BranchContent node={node} />
              </div>
            ))}
          </div>

          <div className="center-node-wrapper">
            <button
              type="button"
              className="center-node"
              onClick={() => {
                if (!user) {
                  alert('カテゴリの追加にはログインが必要です。');
                  return;
                }
                if (mindMapData.length >= 6) {
                  alert('カテゴリは最大6個までしか作成できません。');
                  return;
                }
                setIsAddCategoryModalOpen(true);
              }}
              aria-label="新しいカテゴリを追加する"
            >
              <h1>AIツールマップ</h1>
              <br/>
              <AddIcon className="add-icon" />
            </button>
          </div>

          {/* --- 右カラム --- */}
          <div className="branch-column column-right">
            {rightBranches.map((node) => (
              <div className="branch" key={node.category}>
                <BranchContent node={node} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};