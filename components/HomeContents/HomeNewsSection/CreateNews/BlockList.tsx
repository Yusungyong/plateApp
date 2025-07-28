import React from 'react';
import { StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import BlockItem from './BlockItem';

interface Block {
  id: string;
  type: 'title' | 'text' | 'image';
  content?: string;
  uris?: string[];
  aspectRatios?: number[];
}

interface Props {
  blocks: Block[];
  onBlocksChange: (updated: Block[]) => void;
  onUpdateContent: (id: string, content: string) => void;
  onDeleteBlock: (id: string) => void;
}

const BlockList: React.FC<Props> = ({
  blocks,
  onBlocksChange,
  onUpdateContent,
  onDeleteBlock,
}) => {
  return (
    <DraggableFlatList
      data={blocks}
      onDragEnd={({ data }) => onBlocksChange(data)}
      keyExtractor={(item) => item.id}
      renderItem={({ item, drag, isActive }) => (
        <BlockItem
          key={item.id}
          item={item}
          drag={drag}
          isActive={isActive}
          onUpdateContent={onUpdateContent}
          onDelete={onDeleteBlock}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: 100,
    paddingBottom: 120,
  },
});

export default BlockList;
