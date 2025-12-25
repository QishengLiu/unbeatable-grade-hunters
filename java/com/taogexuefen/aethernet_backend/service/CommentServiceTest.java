package com.taogexuefen.aethernet_backend.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taogexuefen.aethernet_backend.mapper.*;
import com.taogexuefen.aethernet_backend.model.dto.CommentCreateRequest;
import com.taogexuefen.aethernet_backend.model.entity.*;
import com.taogexuefen.aethernet_backend.model.vo.CommentVO;
import com.taogexuefen.aethernet_backend.service.impl.CommentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentMapper commentMapper;
    
    @Mock
    private PostMapper postMapper;
    
    @Mock
    private UserMapper userMapper;
    
    @Mock
    private LikeMapper likeMapper;

    @InjectMocks
    private CommentServiceImpl commentService;

    private Comment comment;
    private CommentCreateRequest commentCreateRequest;
    private User user;
    private Post post;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setStudentId("20210001");
        user.setRole("student");

        post = new Post();
        post.setPostId(1L);
        post.setTitle("Test Post");
        post.setContent("This is a test post content");
        post.setUserId(1L);
        post.setCategoryId(1L);
        post.setCommentCount(0); // Added comment count

        commentCreateRequest = new CommentCreateRequest();
        commentCreateRequest.setPostId(1L);
        commentCreateRequest.setContent("This is a test comment");
        commentCreateRequest.setParentId(null);

        comment = new Comment();
        comment.setCommentId(1L);
        comment.setPostId(1L);
        comment.setUserId(1L);
        comment.setContent("This is a test comment");
        comment.setParentId(null);
        comment.setStatus(1);
        comment.setLikeCount(0);
        comment.setReplyCount(0);
        comment.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testCreateComment() {
        System.out.println("=== 测试创建评论功能 ===");
        // Arrange
        lenient().when(postMapper.selectById(anyLong())).thenReturn(post);
        lenient().when(userMapper.selectById(anyLong())).thenReturn(user);
        
        // 在Mockito的answer中设置评论ID并返回插入结果
        when(commentMapper.insert(any(Comment.class)))
            .thenAnswer(invocation -> {
                Comment comment = invocation.getArgument(0);
                comment.setCommentId(1L); // 设置评论ID
                return 1;
            });
        
        // Act
        Long commentId = commentService.createComment(commentCreateRequest, 1L);

        // Assert
        System.out.println("评论创建结果: " + commentId);
        assertNotNull(commentId, "评论ID不应为空");
        assertEquals(Long.valueOf(1), commentId, "评论ID应为1");
        verify(commentMapper, times(1)).insert(any(Comment.class));

        // Verify that the comment was properly created
        ArgumentCaptor<Comment> commentCaptor = ArgumentCaptor.forClass(Comment.class);
        verify(commentMapper).insert(commentCaptor.capture());
        Comment capturedComment = commentCaptor.getValue();
        System.out.println("创建的评论内容: " + capturedComment.getContent());
        System.out.println("创建的评论帖子ID: " + capturedComment.getPostId());
        System.out.println("创建的评论用户ID: " + capturedComment.getUserId());
        assertEquals(commentCreateRequest.getContent(), capturedComment.getContent(), "评论内容应匹配");
        assertEquals(commentCreateRequest.getPostId(), capturedComment.getPostId(), "帖子ID应匹配");
        assertEquals(Long.valueOf(1), capturedComment.getUserId(), "用户ID应为1");
        assertEquals(commentCreateRequest.getParentId(), capturedComment.getParentId(), "父评论ID应匹配");
        assertNotNull(capturedComment.getCreatedAt(), "评论创建时间不应为空");
        System.out.println("=== 创建评论功能测试通过 ===\n");
    }

    @Test
    void testDeleteComment() {
        System.out.println("=== 测试删除评论功能 ===");
        // Arrange
        lenient().when(commentMapper.selectById(anyLong())).thenReturn(comment);
        lenient().when(postMapper.selectById(anyLong())).thenReturn(post); // 需要返回帖子以更新评论数
        when(commentMapper.updateById(any(Comment.class))).thenReturn(1);

        // Act
        boolean result = commentService.deleteComment(1L, 1L);

        // Assert
        System.out.println("删除评论结果: " + (result ? "成功" : "失败"));
        assertTrue(result, "删除结果应为成功");
        verify(commentMapper, times(1)).updateById(any(Comment.class));
        System.out.println("=== 删除评论功能测试通过 ===\n");
    }

    @Test
    void testGetPostComments() {
        System.out.println("=== 测试获取帖子评论列表功能 ===");
        // Arrange
        lenient().when(postMapper.selectById(anyLong())).thenReturn(post);
        
        // 创建期望的分页结果
        Page<Comment> expectedPage = new Page<>(1, 10);
        expectedPage.setRecords(List.of(comment));
        
        // 在Mockito的answer中设置分页结果
        when(commentMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
            .thenAnswer(invocation -> {
                Page<Comment> passedPage = invocation.getArgument(0);
                passedPage.setRecords(expectedPage.getRecords());
                passedPage.setTotal(expectedPage.getTotal());
                return passedPage;
            });
        
        lenient().when(likeMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);

        // Act
        Page<CommentVO> result = commentService.getPostComments(1L, 1, 10, "createdAt", "desc", 1L);

        // Assert
        System.out.println("获取评论列表结果: " + result.getRecords().size() + " 条记录");
        assertNotNull(result, "结果不应为空");
        assertEquals(1, result.getRecords().size(), "评论数量应为1");
        verify(commentMapper, times(1)).selectPage(any(Page.class), any(LambdaQueryWrapper.class));
        System.out.println("获取的评论数量: " + result.getRecords().size());
        System.out.println("=== 获取帖子评论列表功能测试通过 ===\n");
    }

    @Test
    void testGetCommentReplies() {
        System.out.println("=== 测试获取评论回复列表功能 ===");
        // Arrange
        lenient().when(commentMapper.selectById(anyLong())).thenReturn(comment);
        
        // 创建期望的分页结果
        Page<Comment> expectedPage = new Page<>(1, 10);
        expectedPage.setRecords(List.of(comment));
        
        // 在Mockito的answer中设置分页结果
        when(commentMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
            .thenAnswer(invocation -> {
                Page<Comment> passedPage = invocation.getArgument(0);
                passedPage.setRecords(expectedPage.getRecords());
                passedPage.setTotal(expectedPage.getTotal());
                return passedPage;
            });
        
        lenient().when(likeMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);

        // Act
        Page<CommentVO> result = commentService.getCommentReplies(1L, 1, 10, "createdAt", "desc", 1L);

        // Assert
        System.out.println("获取评论回复列表结果: " + result.getRecords().size() + " 条记录");
        assertNotNull(result, "结果不应为空");
        assertEquals(1, result.getRecords().size(), "回复数量应为1");
        verify(commentMapper, times(1)).selectPage(any(Page.class), any(LambdaQueryWrapper.class));
        System.out.println("获取的回复数量: " + result.getRecords().size());
        System.out.println("=== 获取评论回复列表功能测试通过 ===\n");
    }

    @Test
    void testLikeComment() {
        System.out.println("=== 测试点赞评论功能 ===");
        // Arrange
        lenient().when(commentMapper.selectById(anyLong())).thenReturn(comment);
        lenient().when(likeMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(likeMapper.insert(any(Like.class))).thenReturn(1);
        when(commentMapper.updateById(any(Comment.class))).thenReturn(1);

        // Act
        CommentService.LikeResult result = commentService.likeComment(1L, 1L);

        // Assert
        System.out.println("点赞评论结果 - 是否点赞: " + result.getIsLiked() + ", 点赞数: " + result.getLikeCount());
        assertNotNull(result, "点赞结果不应为空");
        assertTrue(result.getIsLiked(), "点赞状态应为true");
        assertEquals(Integer.valueOf(1), result.getLikeCount(), "点赞数应为1");
        System.out.println("=== 点赞评论功能测试通过 ===\n");
    }
}