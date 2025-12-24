package com.ls.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.ls.entity.History;
import com.ls.service.HistoryService;
import jakarta.annotation.Resource;
import net.sf.jsqlparser.expression.DateTimeLiteralExpression;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.deepseek.DeepSeekChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    private final DeepSeekChatModel chatModel;

    private final ChatClient chatClient;

    @Resource
    private HistoryService historyService;

    @Resource
    private EmbeddingModel embeddingModel;

    @Autowired
    public ChatController(DeepSeekChatModel chatModel, ChatClient chatClient) {
        this.chatModel = chatModel;
        this.chatClient = chatClient;
    }

//    @GetMapping("sessionId")
//    public Long getSessionId(){
//        historyService.getOne(
//                new LambdaQueryWrapper<History>()
//                        .eq(History::getId,)
//        )
//    }

    @GetMapping("/ai/generate")
    public String generate(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
//        return Map.of("generation", chatModel.call(message));
        return chatClient.prompt("你是java大师").user("帮我写一段helloworld").call().content();
    }


    /**
     * 流式输出
     * @param message
     * @param sessionId
     * @return
     */
    @GetMapping(value = "/ai/generateStream",produces = "text/html;charset = UTF-8")
    public Flux<String> generateStream(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message,
                                       @RequestParam(value = "sessionId", defaultValue = "1") Long sessionId) {
        //保存上下文，保存在数据库，导入mybatis-plus and mysql
        //1.发送message时记录history
        History userHistory = new History();
        userHistory.setDatetime(LocalDateTime.now());
        userHistory.setRole("user");
        userHistory.setContent(message);
        userHistory.setSessionId(sessionId);
        historyService.save(userHistory);

        //2.获取聊天记录，需要会话id
        List<History>histories = new ArrayList<>();
        histories = historyService.list(
                new LambdaQueryWrapper<History>()
                        .eq(History::getSessionId,sessionId)
                        .ne(History::getId,userHistory.getId())
        );

        //3.将聊天记录转成List<Message>
        List<Message> messages = histories.stream().map(history ->
                "user".equals(history.getRole())?new UserMessage(history.getContent()):new AssistantMessage(history.getContent()))
                .collect(Collectors.toList());

        StringBuilder stringBuilder = new StringBuilder();

        //3.将聊天记录与新对话绑定
        Flux<String> stream = chatClient.prompt("你是一个农业学家").user(message).messages(messages).stream().content();
        return stream.doOnNext(s->stringBuilder.append(s))
                .doOnComplete(()->{
                    History assistantHistory = new History();
                    assistantHistory.setDatetime(LocalDateTime.now());
                    assistantHistory.setRole("assistant");
                    assistantHistory.setContent(stringBuilder.toString());
                    assistantHistory.setSessionId(sessionId);
                    historyService.save(assistantHistory);
                });
//        var prompt = new Prompt(new UserMessage(message));
//        return chatModel.stream(prompt).map(chatResponse -> chatResponse
//                .getResult()
//                .getOutput()
//                .getText());
    }


    /**
     * 向量化
     * @param message
     * @return
     */
    @GetMapping("/ai/embedding")
    public Map embed(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
        EmbeddingResponse embeddingResponse = this.embeddingModel.embedForResponse(List.of(message));
        return Map.of("embedding", embeddingResponse);
    }
}