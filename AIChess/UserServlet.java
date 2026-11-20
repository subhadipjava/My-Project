import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;

public class UserServlet extends HttpServlet {

    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");

        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);

        if (session != null &&
            session.getAttribute("username") != null) {

            String username =
                    (String) session.getAttribute("username");

            out.print(username);

        } else {

            out.print("Guest");
        }
    }
}