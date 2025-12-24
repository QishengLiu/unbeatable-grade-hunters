package com.taogexuefen.aethernet_backend.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taogexuefen.aethernet_backend.mapper.TagMapper;
import com.taogexuefen.aethernet_backend.model.dto.TagCreateRequest;
import com.taogexuefen.aethernet_backend.model.entity.Tag;
import com.taogexuefen.aethernet_backend.service.impl.TagServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private TagMapper tagMapper;

    @InjectMocks
    private TagServiceImpl tagService;

    private Tag tag;
    private TagCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        tag = new Tag();
        tag.setTagId(1L);
        tag.setTagName("学习");
        tag.setPostCount(5);
        tag.setCreatedAt(LocalDateTime.now());

        createRequest = new TagCreateRequest();
        createRequest.setTagName("新标签");
    }

    @Test
    void testCreateTag() {
        System.out.println("=== 测试创建标签功能 ===");
        // Arrange
        lenient().when(tagMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        lenient().when(tagMapper.insert(any(Tag.class))).thenReturn(1);

        // Act
        Tag result = tagService.createTag(createRequest);

        // Assert
        System.out.println("标签创建结果: " + (result != null ? "成功" : "失败"));
        assertNotNull(result, "标签创建结果不应为空");
        verify(tagMapper, times(1)).insert(any(Tag.class));

        // Verify that the tag was properly created
        ArgumentCaptor<Tag> tagCaptor = ArgumentCaptor.forClass(Tag.class);
        verify(tagMapper).insert(tagCaptor.capture());
        Tag capturedTag = tagCaptor.getValue();
        System.out.println("创建的标签名称: " + capturedTag.getTagName());
        assertEquals(createRequest.getTagName(), capturedTag.getTagName(), "标签名称应匹配");
        assertEquals(Integer.valueOf(0), capturedTag.getPostCount(), "初始帖子数应为0");
        assertNotNull(capturedTag.getCreatedAt(), "创建时间不应为空");
        System.out.println("=== 创建标签功能测试通过 ===\n");
    }

    @Test
    void testCreateTag_AlreadyExists() {
        System.out.println("=== 测试标签已存在情况下的创建功能 ===");
        // Arrange
        lenient().when(tagMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            tagService.createTag(createRequest);
        }, "标签已存在时应抛出异常");
        System.out.println("=== 标签已存在异常测试通过 ===\n");
    }

    @Test
    void testSearchTagsByName() {
        System.out.println("=== 测试按名称搜索标签功能 ===");
        // Arrange
        String tagName = "学习";
        lenient().when(tagMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(tag));

        // Act
        List<Tag> result = tagService.searchTagsByName(tagName);

        // Assert
        System.out.println("搜索标签结果: " + result.size() + " 个标签");
        assertNotNull(result, "搜索结果不应为空");
        assertEquals(1, result.size(), "搜索结果数量应为1");
        assertEquals(tag.getTagId(), result.get(0).getTagId(), "标签ID应匹配");
        assertEquals(tag.getTagName(), result.get(0).getTagName(), "标签名称应匹配");
        verify(tagMapper, times(1)).selectList(any(LambdaQueryWrapper.class));
        System.out.println("搜索到的标签名称: " + result.get(0).getTagName());
        System.out.println("=== 按名称搜索标签功能测试通过 ===\n");
    }

    @Test
    void testGetTagList() {
        System.out.println("=== 测试获取标签列表功能 ===");
        // Arrange
        Page<Tag> expectedPage = new Page<>(1, 10);
        expectedPage.setRecords(List.of(tag));
        
        // 在Mockito的answer中创建一个新的Page对象，避免原对象被修改
        when(tagMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
            .thenAnswer(invocation -> {
                Page<Tag> passedPage = invocation.getArgument(0);
                passedPage.setRecords(expectedPage.getRecords());
                passedPage.setTotal(expectedPage.getTotal());
                return passedPage;
            });

        // Act
        Page<Tag> result = tagService.getTagList(1, 10);

        // Assert
        System.out.println("获取标签列表结果: " + result.getRecords().size() + " 条记录");
        assertNotNull(result, "结果不应为空");
        assertEquals(1, result.getRecords().size(), "标签数量应为1");
        assertEquals(tag.getTagId(), result.getRecords().get(0).getTagId(), "标签ID应匹配");
        assertEquals(tag.getTagName(), result.getRecords().get(0).getTagName(), "标签名称应匹配");
        verify(tagMapper, times(1)).selectPage(any(Page.class), any(LambdaQueryWrapper.class));
        System.out.println("获取的标签数量: " + result.getRecords().size());
        System.out.println("=== 获取标签列表功能测试通过 ===\n");
    }
}