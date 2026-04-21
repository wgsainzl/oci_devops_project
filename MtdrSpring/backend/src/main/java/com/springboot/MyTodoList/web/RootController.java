package com.springboot.MyTodoList.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class RootController {

    @GetMapping("/")
    public RedirectView redirectToTasks() {
        return new RedirectView("/tasks");
    }
}
