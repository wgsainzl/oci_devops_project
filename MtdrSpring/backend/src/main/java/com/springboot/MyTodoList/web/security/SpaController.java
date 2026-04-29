import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
            "/",
            "/login",
            "/register",
            "/oauth2/redirect",
            "/home",
            "/timeline",
            "/api-docs"
    })
    public String forward() {
        return "forward:/index.html";
    }
}