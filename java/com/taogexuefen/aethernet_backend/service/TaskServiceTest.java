package com.taogexuefen.aethernet_backend.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taogexuefen.aethernet_backend.mapper.*;
import com.taogexuefen.aethernet_backend.model.dto.TaskCreateRequest;
import com.taogexuefen.aethernet_backend.model.dto.TaskQueryDTO;
import com.taogexuefen.aethernet_backend.model.entity.*;
import com.taogexuefen.aethernet_backend.model.vo.TaskDetailVO;
import com.taogexuefen.aethernet_backend.model.vo.TaskVO;
import com.taogexuefen.aethernet_backend.service.impl.TaskServiceImpl;
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
class TaskServiceTest {

    @Mock
    private TaskMapper taskMapper;
    
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private TaskServiceImpl taskService;

    private Task task;
    private TaskCreateRequest taskCreateRequest;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setStudentId("20210001");
        user.setRole("student");

        taskCreateRequest = new TaskCreateRequest();
        taskCreateRequest.setTitle("Test Task");
        taskCreateRequest.setDescription("This is a test task description");
        taskCreateRequest.setReward(new BigDecimal("10.0"));  // Changed from double to BigDecimal
        taskCreateRequest.setDeadline(LocalDateTime.now().plusDays(7));

        task = new Task();
        task.setTaskId(1L);
        task.setTitle("Test Task");
        task.setDescription("This is a test task description");
        task.setReward(new BigDecimal("10.0"));  // Changed from double to BigDecimal
        task.setPublisherId(1L);
        task.setDeadline(LocalDateTime.now().plusDays(7));
        task.setStatus("pending");
        task.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testCreateTask() {
        System.out.println("=== 测试创建任务功能 ===");
        // Arrange
        lenient().when(userMapper.selectById(anyLong())).thenReturn(user);
        
        // 在Mockito的answer中设置任务ID并返回插入结果
        when(taskMapper.insert(any(Task.class)))
            .thenAnswer(invocation -> {
                Task task = invocation.getArgument(0);
                task.setTaskId(1L); // 设置任务ID
                return 1;
            });

        // Act
        Long taskId = taskService.createTask(taskCreateRequest, 1L);

        // Assert
        System.out.println("任务创建结果: " + taskId);
        assertNotNull(taskId, "任务ID不应为空");
        assertEquals(Long.valueOf(1), taskId, "任务ID应为1");
        verify(taskMapper, times(1)).insert(any(Task.class));

        // Verify that the task was properly created
        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskMapper).insert(taskCaptor.capture());
        Task capturedTask = taskCaptor.getValue();
        System.out.println("创建的任务标题: " + capturedTask.getTitle());
        System.out.println("创建的任务描述: " + capturedTask.getDescription());
        System.out.println("创建的任务奖励: " + capturedTask.getReward());
        assertEquals(taskCreateRequest.getTitle(), capturedTask.getTitle(), "任务标题应匹配");
        assertEquals(taskCreateRequest.getDescription(), capturedTask.getDescription(), "任务描述应匹配");
        assertEquals(taskCreateRequest.getReward(), capturedTask.getReward(), "任务奖励应匹配");
        assertEquals(Long.valueOf(1), capturedTask.getPublisherId(), "发布者ID应为1");
        assertEquals("open", capturedTask.getStatus(), "任务状态应为open");
        assertNotNull(capturedTask.getCreatedAt(), "任务创建时间不应为空");
        System.out.println("=== 创建任务功能测试通过 ===\n");
    }

    @Test
    void testGetTaskList() {
        System.out.println("=== 测试获取任务列表功能 ===");
        // Arrange
        TaskQueryDTO queryDTO = new TaskQueryDTO();
        queryDTO.setPage(1);
        queryDTO.setSize(10);
        
        // 创建期望的分页结果
        Page<Task> expectedPage = new Page<>(1, 10);
        expectedPage.setRecords(List.of(task));
        
        // 在Mockito的answer中设置分页结果
        when(taskMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
            .thenAnswer(invocation -> {
                Page<Task> passedPage = invocation.getArgument(0);
                passedPage.setRecords(expectedPage.getRecords());
                passedPage.setTotal(expectedPage.getTotal());
                return passedPage;
            });

        // Act
        Page<TaskVO> result = taskService.getTaskList(queryDTO);

        // Assert
        System.out.println("获取任务列表结果: " + result.getRecords().size() + " 条记录");
        assertNotNull(result, "结果不应为空");
        assertEquals(1, result.getRecords().size(), "任务数量应为1");
        verify(taskMapper, times(1)).selectPage(any(Page.class), any(LambdaQueryWrapper.class));
        System.out.println("获取的任务数量: " + result.getRecords().size());
        System.out.println("=== 获取任务列表功能测试通过 ===\n");
    }

    @Test
    void testGetTaskDetail() {
        System.out.println("=== 测试获取任务详情功能 ===");
        // Arrange
        Long taskId = 1L;
        lenient().when(taskMapper.selectById(taskId)).thenReturn(task);
        lenient().when(userMapper.selectById(anyLong())).thenReturn(user);

        // Act
        TaskDetailVO result = taskService.getTaskDetail(taskId);

        // Assert
        System.out.println("获取任务详情结果: " + (result != null ? "成功" : "失败"));
        assertNotNull(result, "任务详情不应为空");
        assertEquals(taskId, result.getTaskId(), "任务ID应匹配");
        assertEquals("Test Task", result.getTitle(), "任务标题应为'Test Task'");
        verify(taskMapper, times(1)).selectById(taskId);
        System.out.println("获取的任务ID: " + result.getTaskId());
        System.out.println("获取的任务标题: " + result.getTitle());
        System.out.println("=== 获取任务详情功能测试通过 ===\n");
    }

    @Test
    void testAcceptTask() {
        System.out.println("=== 测试接受任务功能 ===");
        // Arrange
        Task openTask = new Task();
        openTask.setTaskId(1L);
        openTask.setTitle("Test Task");
        openTask.setDescription("This is a test task description");
        openTask.setReward(new BigDecimal("10.0"));
        openTask.setPublisherId(1L);
        openTask.setAssigneeId(null);
        openTask.setStatus("open"); // 设置为open状态，可以接单
        openTask.setCreatedAt(LocalDateTime.now().minusDays(1));
        
        lenient().when(taskMapper.selectById(anyLong())).thenReturn(openTask);
        when(taskMapper.updateById(any(Task.class))).thenReturn(1);

        // Act
        boolean result = taskService.acceptTask(1L, 2L);

        // Assert
        System.out.println("接受任务结果: " + (result ? "成功" : "失败"));
        assertTrue(result, "接受任务结果应为成功");
        verify(taskMapper, times(1)).updateById(any(Task.class));
        System.out.println("=== 接受任务功能测试通过 ===\n");
    }

    @Test
    void testCompleteTask() {
        System.out.println("=== 测试完成任务功能 ===");
        // Arrange
        Task inProgressTask = new Task();
        inProgressTask.setTaskId(1L);
        inProgressTask.setTitle("Test Task");
        inProgressTask.setDescription("This is a test task description");
        inProgressTask.setReward(new BigDecimal("10.0"));
        inProgressTask.setPublisherId(1L);
        inProgressTask.setAssigneeId(2L); // 设置接单者为2L
        inProgressTask.setStatus("in_progress"); // 设置为进行中状态，可以完成
        inProgressTask.setCreatedAt(LocalDateTime.now().minusDays(1));
        
        lenient().when(taskMapper.selectById(anyLong())).thenReturn(inProgressTask);
        when(taskMapper.updateById(any(Task.class))).thenReturn(1);

        // Act
        boolean result = taskService.completeTask(1L, 2L);

        // Assert
        System.out.println("完成任务结果: " + (result ? "成功" : "失败"));
        assertTrue(result, "完成任务结果应为成功");
        verify(taskMapper, times(1)).updateById(any(Task.class));
        System.out.println("=== 完成任务功能测试通过 ===\n");
    }

    @Test
    void testDeleteTask() {
        System.out.println("=== 测试删除任务功能 ===");
        // Arrange
        lenient().when(taskMapper.selectById(anyLong())).thenReturn(task);
        lenient().when(taskMapper.deleteById(anyLong())).thenReturn(1);

        // Act
        boolean result = taskService.deleteTask(1L, 1L);

        // Assert
        System.out.println("删除任务结果: " + (result ? "成功" : "失败"));
        assertTrue(result, "删除任务结果应为成功");
        verify(taskMapper, times(1)).deleteById(1L);
        System.out.println("=== 删除任务功能测试通过 ===\n");
    }
}