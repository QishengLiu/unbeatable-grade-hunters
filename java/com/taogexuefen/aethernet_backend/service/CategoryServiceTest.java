package com.taogexuefen.aethernet_backend.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taogexuefen.aethernet_backend.mapper.CategoryMapper;
import com.taogexuefen.aethernet_backend.model.dto.CategoryCreateRequest;
import com.taogexuefen.aethernet_backend.model.dto.CategoryQueryDTO;
import com.taogexuefen.aethernet_backend.model.dto.CategoryUpdateRequest;
import com.taogexuefen.aethernet_backend.model.entity.Category;
import com.taogexuefen.aethernet_backend.model.vo.CategoryVO;
import com.taogexuefen.aethernet_backend.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category category;
    private CategoryCreateRequest categoryCreateRequest;
    private CategoryUpdateRequest categoryUpdateRequest;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setCategoryId(1L);
        category.setCategoryName("互助");
        category.setCategoryCode("help");
        category.setSortOrder(1);

        categoryCreateRequest = new CategoryCreateRequest();
        categoryCreateRequest.setCategoryName("新分类");
        categoryCreateRequest.setCategoryCode("new");
        categoryCreateRequest.setSortOrder(2);

        categoryUpdateRequest = new CategoryUpdateRequest();
        categoryUpdateRequest.setCategoryName("更新分类");
        categoryUpdateRequest.setCategoryCode("updated");
        categoryUpdateRequest.setSortOrder(3);
    }

    @Test
    void testGetAllCategories() {
        System.out.println("=== 测试获取所有分类列表功能 ===");
        // Arrange
        lenient().when(categoryMapper.selectList(null)).thenReturn(List.of(category));

        // Act
        List<CategoryVO> result = categoryService.getAllCategories();

        // Assert
        System.out.println("获取分类列表结果: " + result.size() + " 个分类");
        assertNotNull(result, "结果不应为空");
        assertEquals(1, result.size(), "分类数量应为1");
        verify(categoryMapper, times(1)).selectList(isNull());
        System.out.println("获取的分类数量: " + result.size());
        System.out.println("=== 获取所有分类列表功能测试通过 ===\n");
    }

    @Test
    void testGetCategoryList() {
        System.out.println("=== 测试获取分类分页列表功能 ===");
        // Arrange
        CategoryQueryDTO queryDTO = new CategoryQueryDTO();
        queryDTO.setPage(1);
        queryDTO.setSize(10);
        
        Page<Category> expectedPage = new Page<>(1, 10);
        expectedPage.setRecords(List.of(category));
        // 在Mockito的answer中创建一个新的Page对象，避免原对象被修改
        when(categoryMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
            .thenAnswer(invocation -> {
                Page<Category> passedPage = invocation.getArgument(0);
                passedPage.setRecords(expectedPage.getRecords());
                passedPage.setTotal(expectedPage.getTotal());
                return passedPage;
            });

        // Act
        Page<Category> result = categoryService.getCategoryList(queryDTO);

        // Assert
        System.out.println("获取分类分页列表结果: " + result.getRecords().size() + " 条记录");
        assertNotNull(result, "结果不应为空");
        assertEquals(1, result.getRecords().size(), "分类数量应为1");
        verify(categoryMapper, times(1)).selectPage(any(Page.class), any(LambdaQueryWrapper.class));
        System.out.println("获取的分类数量: " + result.getRecords().size());
        System.out.println("=== 获取分类分页列表功能测试通过 ===\n");
    }

    @Test
    void testGetCategoryById() {
        System.out.println("=== 测试根据ID获取分类功能 ===");
        // Arrange
        Long categoryId = 1L;
        lenient().when(categoryMapper.selectById(categoryId)).thenReturn(category);

        // Act
        Category result = categoryService.getCategoryById(categoryId);

        // Assert
        System.out.println("获取分类结果: " + (result != null ? "成功" : "失败"));
        assertNotNull(result, "分类不应为空");
        assertEquals(categoryId, result.getCategoryId(), "分类ID应匹配");
        assertEquals("互助", result.getCategoryName(), "分类名称应为'互助'");
        verify(categoryMapper, times(1)).selectById(categoryId);
        System.out.println("获取的分类ID: " + result.getCategoryId());
        System.out.println("获取的分类名称: " + result.getCategoryName());
        System.out.println("=== 根据ID获取分类功能测试通过 ===\n");
    }

    @Test
    void testCreateCategory() {
        System.out.println("=== 测试创建分类功能 ===");
        // Arrange
        lenient().when(categoryMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        lenient().when(categoryMapper.insert(any(Category.class))).thenReturn(1);

        // Act
        Category result = categoryService.createCategory(categoryCreateRequest);

        // Assert
        System.out.println("分类创建结果: " + (result != null ? "成功" : "失败"));
        assertNotNull(result, "创建结果不应为空");
        assertEquals(categoryCreateRequest.getCategoryName(), result.getCategoryName(), "分类名称应匹配");
        verify(categoryMapper, times(1)).insert(any(Category.class));

        // Verify that the category was properly created
        ArgumentCaptor<Category> categoryCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryMapper).insert(categoryCaptor.capture());
        Category capturedCategory = categoryCaptor.getValue();
        System.out.println("创建的分类名称: " + capturedCategory.getCategoryName());
        System.out.println("创建的分类代码: " + capturedCategory.getCategoryCode());
        assertEquals(categoryCreateRequest.getCategoryName(), capturedCategory.getCategoryName(), "分类名称应匹配创建请求");
        assertEquals(categoryCreateRequest.getCategoryCode(), capturedCategory.getCategoryCode(), "分类代码应匹配创建请求");
        assertEquals(categoryCreateRequest.getSortOrder(), capturedCategory.getSortOrder(), "分类排序应匹配创建请求");
        System.out.println("=== 创建分类功能测试通过 ===\n");
    }

    @Test
    void testUpdateCategory() {
        System.out.println("=== 测试更新分类功能 ===");
        // Arrange
        lenient().when(categoryMapper.selectById(anyLong())).thenReturn(category);
        lenient().when(categoryMapper.updateById(any(Category.class))).thenReturn(1);

        // Act
        Category result = categoryService.updateCategory(1L, categoryUpdateRequest);

        // Assert
        System.out.println("分类更新结果: " + (result != null ? "成功" : "失败"));
        assertNotNull(result, "更新结果不应为空");
        assertEquals(categoryUpdateRequest.getCategoryName(), result.getCategoryName(), "分类名称应匹配更新请求");
        verify(categoryMapper, times(1)).updateById(any(Category.class));

        // Verify that the category was properly updated
        ArgumentCaptor<Category> categoryCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryMapper).updateById(categoryCaptor.capture());
        Category capturedCategory = categoryCaptor.getValue();
        System.out.println("更新的分类名称: " + capturedCategory.getCategoryName());
        System.out.println("更新的分类代码: " + capturedCategory.getCategoryCode());
        assertEquals(categoryUpdateRequest.getCategoryName(), capturedCategory.getCategoryName(), "分类名称应匹配更新请求");
        assertEquals(categoryUpdateRequest.getCategoryCode(), capturedCategory.getCategoryCode(), "分类代码应匹配更新请求");
        assertEquals(categoryUpdateRequest.getSortOrder(), capturedCategory.getSortOrder(), "分类排序应匹配更新请求");
        System.out.println("=== 更新分类功能测试通过 ===\n");
    }

    @Test
    void testDeleteCategory() {
        System.out.println("=== 测试删除分类功能 ===");
        // Arrange
        lenient().when(categoryMapper.selectById(anyLong())).thenReturn(category);
        lenient().when(categoryMapper.deleteById(anyLong())).thenReturn(1);

        // Act
        boolean result = categoryService.deleteCategory(1L);

        // Assert
        System.out.println("删除分类结果: " + (result ? "成功" : "失败"));
        assertTrue(result, "删除结果应为成功");
        verify(categoryMapper, times(1)).deleteById(1L);
        System.out.println("=== 删除分类功能测试通过 ===\n");
    }
}