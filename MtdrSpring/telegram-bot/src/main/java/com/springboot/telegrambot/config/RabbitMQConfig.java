package com.springboot.telegrambot.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Must match backend exactly
    public static final String TASK_COMMANDS_QUEUE  = "task.commands";
    public static final String TASK_RPC_REQUEST     = "task.rpc.request";
    public static final String TASK_RPC_REPLY       = "task.rpc.reply";
    public static final String EXCHANGE             = "mtdr.exchange";
    public static final String RK_TASK_COMMAND      = "task.command";
    public static final String RK_TASK_RPC_REQ      = "task.rpc.req";
    public static final String RK_TASK_RPC_REPLY    = "task.rpc.reply";

    @Bean
    public TopicExchange mtdrExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean public Queue taskCommandsQueue() { return new Queue(TASK_COMMANDS_QUEUE, true); }
    @Bean public Queue taskRpcRequestQueue() { return new Queue(TASK_RPC_REQUEST, true); }
    @Bean public Queue taskRpcReplyQueue() { return new Queue(TASK_RPC_REPLY, true); }

    @Bean public Binding taskCommandBinding() {
        return BindingBuilder.bind(taskCommandsQueue()).to(mtdrExchange()).with(RK_TASK_COMMAND);
    }
    @Bean public Binding taskRpcRequestBinding() {
        return BindingBuilder.bind(taskRpcRequestQueue()).to(mtdrExchange()).with(RK_TASK_RPC_REQ);
    }
    @Bean public Binding taskRpcReplyBinding() {
        return BindingBuilder.bind(taskRpcReplyQueue()).to(mtdrExchange()).with(RK_TASK_RPC_REPLY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}