package com.ls;

import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.reader.ExtractedTextFormatter;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.List;

//@SpringBootTest
//class SpringaiApplicationTests {
//    @Resource
//    private EmbeddingModel embeddingModel;
//
//    @Test
//    void contextLoads() {
//    }
//
//    @Test
//    void testMarkDown(){
//        PagePdfDocumentReader pdfReader = new PagePdfDocumentReader("classpath:/MyBatisPlus.pdf",
//                PdfDocumentReaderConfig.builder()
//                        .withPageTopMargin(0)
//                        .withPageExtractedTextFormatter(ExtractedTextFormatter.builder()
//                                .withNumberOfTopTextLinesToDelete(0)
//                                .build())
//                        .withPagesPerDocument(1)
//                        .build());
//
//        List<Document>documents = pdfReader.read();
//        System.out.println(documents.size());
//
//        TokenTextSplitter splitter = new TokenTextSplitter(1000, 400, 10, 10000, true);
//        List<Document>smallDocuments = splitter.apply(documents);
//        System.out.println(smallDocuments.size());
//
//        //向量化
//        smallDocuments.forEach(smallDocument->{
//            System.out.println(Arrays.toString(embeddingModel.embed(smallDocument)));
//        });
//    }
//}
