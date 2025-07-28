import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAddFeedComment } from '../../../../common/commentHooks/useAddFeedComment';
import { useAddFeedReply } from '../../../../common/commentHooks/useAddFeedReply';
import { useUpdateFeedComment } from '../../../../common/commentHooks/useUpdateFeedComment';
import { useUpdateFeedReply } from '../../../../common/commentHooks/useUpdateFeedReply';
import { useDeleteFeedComment } from '../../../../common/commentHooks/useDeleteFeedComment';
import { useDeleteFeedReply } from '../../../../common/commentHooks/useDeleteFeedReply';
import { useGetFeedComments } from '../../../../common/commentHooks/useGetFeedComments';
import { useGetFeedReplies } from '../../../../common/commentHooks/useGetFeedReplies';

interface CommentSectionProps {
  id: number;
  highlightCommentId?: number;
  highlightReplyId?: number;
}

const CommentSection = ({
  id,
  highlightCommentId,
  highlightReplyId,
}: CommentSectionProps) => {
  const flatListRef = useRef<FlatList>(null);

  const { getComments } = useGetFeedComments();
  const { getReplies } = useGetFeedReplies();
  const { addComment } = useAddFeedComment();
  const { addReply } = useAddFeedReply();
  const { updateFeedComment } = useUpdateFeedComment();
  const { deleteFeedComment } = useDeleteFeedComment();
  const { updateFeedReply } = useUpdateFeedReply();
  const { deleteFeedReply } = useDeleteFeedReply();

  const [comments, setComments] = useState<any[]>([]);
  const [replyMap, setReplyMap] = useState<Record<number, any[]>>({});
  const [expandedCommentIds, setExpandedCommentIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<{ commentId: number; nickname: string } | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [highlightedComment, setHighlightedComment] = useState<number | null>(null);
  const [highlightedReply, setHighlightedReply] = useState<number | null>(null);

  useEffect(() => {
    fetchCurrentUsername();
    fetchComments();
  }, [id]);

  const fetchCurrentUsername = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      setCurrentUsername(username);
    } catch (e) {
      console.error('username 가져오기 실패', e);
    }
  };

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await getComments(id);
      setComments(res);
    } catch (e) {
      console.error('댓글 불러오기 실패', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (highlightCommentId && comments.length > 0) {
      const index = comments.findIndex((c) => c.commentId === highlightCommentId);
      if (index >= 0) {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setHighlightedComment(highlightCommentId);
        setTimeout(() => setHighlightedComment(null), 2000);
      }
    }
  }, [highlightCommentId, comments]);

  useEffect(() => {
    if (highlightReplyId && highlightCommentId && comments.length > 0) {
      const parentCommentExists = comments.some(
        (c) => c.commentId === highlightCommentId
      );

      if (parentCommentExists) {
        const alreadyExpanded = expandedCommentIds.includes(highlightCommentId);
        if (!alreadyExpanded) {
          toggleReplies(highlightCommentId);
        }

        setTimeout(() => setHighlightedReply(highlightReplyId), 300);
        setTimeout(() => setHighlightedReply(null), 2300);
      }
    }
  }, [highlightReplyId, highlightCommentId, comments]);

  const toggleReplies = async (commentId: number) => {
    const isExpanded = expandedCommentIds.includes(commentId);

    if (isExpanded) {
      setExpandedCommentIds((prev) => prev.filter((id) => id !== commentId));
    } else {
      if (!replyMap[commentId]) {
        try {
          const replies = await getReplies(commentId);
          setReplyMap((prev) => ({ ...prev, [commentId]: replies }));
        } catch (e) {
          console.error('대댓글 불러오기 실패:', e);
          return;
        }
      }
      setExpandedCommentIds((prev) => [...prev, commentId]);
    }
  };

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) return;

      if (replyTo) {
        await addReply({ username, commentId: replyTo.commentId, content: trimmed, feedId: id });
      } else {
        await addComment({ username, content: trimmed, feedId: id });
      }

      setReplyTo(null);
      await fetchComments();
    } catch (e) {
      console.error('댓글 작성 실패:', e);
    }
  };

  const handleUpdate = async (commentId: number, content: string) => {
    await updateFeedComment(commentId, content);
    await fetchComments();
  };

  const handleDelete = async (commentId: number) => {
    await deleteFeedComment(commentId);
    await fetchComments();
  };

  const handleUpdateReply = async (replyId: number, content: string, parentId: number) => {
    await updateFeedReply(replyId, content);
    const replies = await getReplies(parentId);
    setReplyMap((prev) => ({ ...prev, [parentId]: replies }));
  };

  const handleDeleteReply = async (replyId: number, parentId: number) => {
    await deleteFeedReply(replyId);
    const replies = await getReplies(parentId);
    setReplyMap((prev) => ({ ...prev, [parentId]: replies }));
  };

  const handleBlockComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.commentId !== commentId));
  };

  const handleBlockReply = (replyId: number, parentId: number) => {
    setReplyMap((prev) => {
      const updatedReplies = (prev[parentId] || []).filter((r) => r.replyId !== replyId);
      return { ...prev, [parentId]: updatedReplies };
    });
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#888" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={comments}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.commentId.toString()}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              replies={replyMap[item.commentId] ?? []}
              isExpanded={expandedCommentIds.includes(item.commentId)}
              onToggleReplies={() => toggleReplies(item.commentId)}
              onReply={(info) => setReplyTo(info)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onBlock={(commentId) => handleBlockComment(commentId)}
              onBlockReply={(replyId) => handleBlockReply(replyId, item.commentId)}
              onUpdateReply={(replyId, content) =>
                handleUpdateReply(replyId, content, item.commentId)
              }
              onDeleteReply={(replyId) =>
                handleDeleteReply(replyId, item.commentId)
              }
              currentUsername={currentUsername}
              highlight={highlightedComment === item.commentId}
              highlightReplyId={highlightedReply}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
        />
      )}

      <CommentInput
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
});

export default CommentSection;
