package com.ls.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 聊天记录实体类
 */
@Data
@AllArgsConstructor
@TableName("sys_history")
public class History {

    /**
     * 序列号
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 聊天时间
     */
    private LocalDateTime datetime;

    /**
     * 聊天内容
     */
    private String content;

    /**
     * 角色
     */
    private String role = "user";

    /**
     * 会话Id
     */
    @TableField("sessionId")
    private Long sessionId;

    // 无参构造器
    public History() {

    }


}