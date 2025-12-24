package com.ls;

// 建议dashscope SDK的版本 >= 2.15.0
import com.alibaba.dashscope.app.*;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import io.reactivex.Flowable;// 流式输出
// 智能体应用调用实现流式输出结果
import java.util.Arrays;
import java.lang.System;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.protocol.Protocol;


//public class Main {
//    public static GenerationResult callWithMessage() throws ApiException, NoApiKeyException, InputRequiredException {
//        Generation gen = new Generation(Protocol.HTTP.getValue(), "https://dashscope.aliyuncs.com/api/v1");
//        Message systemMsg = Message.builder()
//                .role(Role.SYSTEM.getValue())
//                .content("You are a helpful assistant.")
//                .build();
//        Message userMsg = Message.builder()
//                .role(Role.USER.getValue())
//                .content("帮我写一个java的简单代码？")
//                .build();
//        GenerationParam param = GenerationParam.builder()
//                // 若没有配置环境变量，请用百炼API Key将下行替换为：.apiKey("sk-xxx")
////        System.getenv("sk-019bcedd770a496d93fde4d7ec139f85")
//                //DASHSCOPE_API_KEY
//                .apiKey("sk-019bcedd770a496d93fde4d7ec139f85")
//                .model("qwen-max")
//                .messages(Arrays.asList(systemMsg, userMsg))
//                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
//                .build();
//        return gen.call(param);
//    }
//    public static void main(String[] args) {
//        try {
//            GenerationResult result = callWithMessage();
//            System.out.println(result.getOutput().getChoices().get(0).getMessage().getContent());
//        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
//            System.err.println("错误信息："+e.getMessage());
//        }
//    }
//}

// 建议dashscope SDK的版本 >= 2.15.0
// 智能体应用调用实现流式输出结果

//public class Main {
//    public static void streamCall() throws NoApiKeyException, InputRequiredException {
//        ApplicationParam param = ApplicationParam.builder()
//                // 若没有配置环境变量，可用百炼API Key将下行替换为：.apiKey("sk-xxx")。但不建议在生产环境中直接将API Key硬编码到代码中，以减少API Key泄露风险。
//                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
//                // 替换为实际的应用 ID
//                .appId("YOUR_APP_ID")
//                .prompt("你是谁?")
//                // 增量输出
//                .incrementalOutput(true)
//                .build();
//        Application application = new Application();
//        // .streamCall（）：流式输出内容
//        Flowable<ApplicationResult> result = application.streamCall(param);
//        result.blockingForEach(data -> {
//            System.out.printf("%s\n",
//                    data.getOutput().getText());
//        });
//    }
//    public static void main(String[] args) {
//        try {
//            streamCall();
//        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
//            System.out.printf("Exception: %s", e.getMessage());
//            System.out.println("请参考文档：https://help.aliyun.com/zh/model-studio/developer-reference/error-code");
//        }
//        System.exit(0);
//    }
//}