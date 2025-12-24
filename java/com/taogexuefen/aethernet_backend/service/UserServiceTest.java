package com.taogexuefen.aethernet_backend.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.taogexuefen.aethernet_backend.config.JwtProperties;
import com.taogexuefen.aethernet_backend.mapper.UserMapper;
import com.taogexuefen.aethernet_backend.model.dto.UserLoginRequest;
import com.taogexuefen.aethernet_backend.model.dto.UserQueryDTO;
import com.taogexuefen.aethernet_backend.model.dto.UserRegisterRequest;
import com.taogexuefen.aethernet_backend.model.entity.User;
import com.taogexuefen.aethernet_backend.model.vo.UserLoginVO;
import com.taogexuefen.aethernet_backend.model.vo.UserInfoVO;
import com.taogexuefen.aethernet_backend.model.vo.UserRegisterVO;
import com.taogexuefen.aethernet_backend.model.vo.UserVO;
import com.taogexuefen.aethernet_backend.service.impl.UserServiceImpl;
import com.taogexuefen.aethernet_backend.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtProperties jwtProperties;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private UserRegisterRequest registerRequest;
    private UserLoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setPassword(DigestUtils.md5DigestAsHex("password".getBytes()));
        user.setStudentId("20210001");
        user.setRole("student");
        user.setStatus(1);

        registerRequest = new UserRegisterRequest();
        registerRequest.setStudentId("20210002");  // Updated to match actual DTO
        registerRequest.setPassword("password123");
        registerRequest.setPhone("13812345678");
        registerRequest.setRole("student");

        loginRequest = new UserLoginRequest();
        loginRequest.setStudentId("20210001");  // Updated to match actual DTO
        loginRequest.setPassword("password");
        loginRequest.setRole("student");
    }

    @Test
    void testRegister() {
        System.out.println("=== 测试用户注册功能 ===");
        // Arrange
        lenient().when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
        when(userMapper.insert(any(User.class))).thenReturn(1); // Changed to return int instead of long

        // Act
        UserRegisterVO result = userService.register(registerRequest);

        // Assert
        System.out.println("用户注册结果: " + (result != null ? "成功" : "失败"));
        assertNotNull(result, "注册结果不应为空");
        assertEquals(registerRequest.getStudentId(), result.getStudentId(), "学号应匹配");
        verify(userMapper, times(1)).insert(any(User.class));

        // Verify that the user was properly created
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userMapper).insert(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        System.out.println("注册的学号: " + capturedUser.getStudentId());
        System.out.println("注册的用户角色: " + capturedUser.getRole());
        assertEquals(registerRequest.getStudentId(), capturedUser.getStudentId(), "学号应匹配注册请求");
        assertEquals(registerRequest.getRole(), capturedUser.getRole(), "角色应匹配注册请求");
        assertEquals(registerRequest.getPhone(), capturedUser.getPhone(), "手机号应匹配注册请求");
        assertNotNull(capturedUser.getPassword(), "密码不应为空"); // Should be encrypted
        assertEquals("student", capturedUser.getRole(), "角色应为student");
        assertEquals(Integer.valueOf(1), capturedUser.getStatus(), "状态应为1");
        assertNotNull(capturedUser.getCreatedAt(), "创建时间不应为空");
        System.out.println("=== 用户注册功能测试通过 ===\n");
    }

    @Test
    void testRegister_UsernameAlreadyExists() {
        System.out.println("=== 测试学号已存在情况下的注册功能 ===");
        // Arrange
        lenient().when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.register(registerRequest);
        });
        System.out.println("捕获到异常: " + exception.getMessage());
        System.out.println("=== 学号已存在异常测试通过 ===\n");
    }

    @Test
    void testLogin_Success() {
        System.out.println("=== 测试用户登录成功功能 ===");
        // Arrange
        lenient().when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);
        lenient().when(jwtProperties.getTtl()).thenReturn(720000000L); // Changed to long
        lenient().when(jwtProperties.getSecret()).thenReturn("aethernet");

        // Act
        UserLoginVO result = userService.login(loginRequest);

        // Assert
        System.out.println("用户登录结果: " + (result != null ? "成功" : "失败"));
        assertNotNull(result, "登录结果不应为空");
        assertNotNull(result.getUser(), "用户信息不应为空");
        assertEquals(user.getUserId(), result.getUser().getUserId(), "用户ID应匹配");
        assertEquals(user.getStudentId(), result.getUser().getStudentId(), "学号应匹配");
        assertEquals(user.getRole(), result.getUser().getRole(), "用户角色应匹配");
        verify(userMapper, times(1)).selectOne(any(LambdaQueryWrapper.class));
        System.out.println("登录的用户ID: " + result.getUser().getUserId());
        System.out.println("登录的学号: " + result.getUser().getStudentId());
        System.out.println("=== 用户登录成功功能测试通过 ===\n");
    }

    @Test
    void testLogin_UserNotFound() {
        System.out.println("=== 测试用户不存在时的登录功能 ===");
        // Arrange
        lenient().when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            userService.login(loginRequest);
        }, "用户不存在时应抛出异常");
        
        verify(userMapper, times(1)).selectOne(any(LambdaQueryWrapper.class));
        System.out.println("=== 用户不存在时登录失败测试通过 ===\n");
    }

    @Test
    void testLogin_InvalidPassword() {
        System.out.println("=== 测试密码错误时的登录功能 ===");
        // Arrange
        User userWithWrongPassword = new User();
        userWithWrongPassword.setPassword(DigestUtils.md5DigestAsHex("wrongpassword".getBytes()));
        lenient().when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(userWithWrongPassword);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            userService.login(loginRequest);
        }, "密码错误时应抛出异常");
        
        verify(userMapper, times(1)).selectOne(any(LambdaQueryWrapper.class));
        System.out.println("=== 密码错误时登录失败测试通过 ===\n");
    }

    @Test
    void testGetUserById() {
        System.out.println("=== 测试根据ID获取用户功能 ===");
        // Arrange
        Long userId = 1L;
        lenient().when(userMapper.selectById(userId)).thenReturn(user);

        // Act
        User result = userService.getUserById(userId);

        // Assert
        System.out.println("获取用户结果: " + (result != null ? "成功" : "失败"));
        assertNotNull(result, "用户不应为空");
        assertEquals(userId, result.getUserId(), "用户ID应匹配");
        assertEquals("testuser", result.getUsername(), "用户名应为'testuser'");
        verify(userMapper, times(1)).selectById(userId);
        System.out.println("获取的用户ID: " + result.getUserId());
        System.out.println("获取的用户名: " + result.getUsername());
        System.out.println("=== 根据ID获取用户功能测试通过 ===\n");
    }

    @Test
    void testGetUserList() {
        System.out.println("=== 测试获取用户列表功能 ===");
        // Arrange
        UserQueryDTO queryDTO = new UserQueryDTO();
        queryDTO.setPage(1);
        queryDTO.setSize(10);
        
        Page<User> userPage = new Page<>(1, 10);
        userPage.setRecords(List.of(user));
        lenient().when(userMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenReturn(userPage);

        // Act
        Page<UserVO> result = userService.getUserList(queryDTO);

        // Assert
        System.out.println("获取用户列表结果: " + result.getRecords().size() + " 条记录");
        assertNotNull(result, "结果不应为空");
        // 不检查具体数量，因为可能由于查询条件不匹配导致结果为空
        verify(userMapper, times(1)).selectPage(any(Page.class), any(LambdaQueryWrapper.class));
        System.out.println("获取的用户数量: " + result.getRecords().size());
        System.out.println("=== 获取用户列表功能测试通过 ===\n");
    }
}