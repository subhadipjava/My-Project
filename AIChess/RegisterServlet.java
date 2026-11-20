import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class RegisterServlet extends HttpServlet {

    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        response.setContentType("text/html");

        PrintWriter out = response.getWriter();

        try {

            Connection con = DBConnection.getConnection();

            String sql =
                    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

            PreparedStatement ps =
                    con.prepareStatement(sql);

            ps.setString(1, username);
            ps.setString(2, email);
            ps.setString(3, password);

            ps.executeUpdate();

String statsSql =
        "INSERT INTO game_stats (user_id) " +
        "SELECT id FROM users WHERE username = ?";

PreparedStatement statsPs =
        con.prepareStatement(statsSql);

statsPs.setString(1, username);
statsPs.executeUpdate();

statsPs.close();

out.println("<h2>Registration Successful!</h2>");
            out.println("<p>Account created successfully.</p>");
            out.println("<a href='login.html'>Go to Login</a>");

            ps.close();
            con.close();

        } catch (Exception e) {

            out.println("<h2>Registration Failed</h2>");
            out.println("<p>" + e.getMessage() + "</p>");
        }
    }
}