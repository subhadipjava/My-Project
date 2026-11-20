import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class LoginServlet extends HttpServlet {

    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        response.setContentType("text/html;charset=UTF-8");

        PrintWriter out = response.getWriter();

        try {

            Connection con = DBConnection.getConnection();

            String sql =
                    "SELECT * FROM users WHERE username = ? AND password = ?";

            PreparedStatement ps =
                    con.prepareStatement(sql);

            ps.setString(1, username);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                HttpSession session = request.getSession();
                session.setAttribute("username", username);

                out.println("<!DOCTYPE html>");
                out.println("<html lang='en'>");
                out.println("<head>");

                out.println("<meta charset='UTF-8'>");
                out.println("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");

                out.println("<title>Login Successful | AI Chess Arena</title>");

                out.println("<style>");

                out.println("* {");
                out.println("    margin: 0;");
                out.println("    padding: 0;");
                out.println("    box-sizing: border-box;");
                out.println("    font-family: Georgia, 'Times New Roman', serif;");
                out.println("}");

                out.println("body {");
                out.println("    min-height: 100vh;");
                out.println("    display: flex;");
                out.println("    align-items: center;");
                out.println("    justify-content: center;");
                out.println("    background:");
                out.println("        linear-gradient(rgba(8,6,4,0.82), rgba(8,6,4,0.88)),");
                out.println("        url('dashboard-bg.png');");
                out.println("    background-size: cover;");
                out.println("    background-position: center;");
                out.println("    color: white;");
                out.println("}");

                out.println(".page {");
                out.println("    width: 100%;");
                out.println("    max-width: 560px;");
                out.println("    padding: 25px;");
                out.println("}");

                out.println(".brand {");
                out.println("    text-align: center;");
                out.println("    margin-bottom: 25px;");
                out.println("    font-size: 22px;");
                out.println("    font-weight: bold;");
                out.println("    letter-spacing: 2px;");
                out.println("    color: #d6a84f;");
                out.println("}");

                out.println(".brand span {");
                out.println("    color: #f1e6c8;");
                out.println("}");

                out.println(".card {");
                out.println("    position: relative;");
                out.println("    text-align: center;");
                out.println("    padding: 55px 40px 45px;");
                out.println("    background: rgba(20, 16, 11, 0.92);");
                out.println("    border: 1px solid rgba(214,168,79,0.45);");
                out.println("    border-radius: 4px;");
                out.println("    box-shadow:");
                out.println("        0 25px 70px rgba(0,0,0,0.65),");
                out.println("        inset 0 0 40px rgba(214,168,79,0.03);");
                out.println("}");

                out.println(".line {");
                out.println("    width: 70px;");
                out.println("    height: 2px;");
                out.println("    background: #d6a84f;");
                out.println("    margin: 0 auto 28px;");
                out.println("}");

                out.println(".chess-symbol {");
                out.println("    width: 76px;");
                out.println("    height: 76px;");
                out.println("    margin: 0 auto 25px;");
                out.println("    display: flex;");
                out.println("    align-items: center;");
                out.println("    justify-content: center;");
                out.println("    border: 1px solid rgba(214,168,79,0.6);");
                out.println("    border-radius: 50%;");
                out.println("    color: #d6a84f;");
                out.println("    font-size: 42px;");
                out.println("}");

                out.println("h1 {");
                out.println("    font-size: 32px;");
                out.println("    letter-spacing: 1px;");
                out.println("    margin-bottom: 14px;");
                out.println("    color: #f5ead0;");
                out.println("}");

                out.println(".welcome {");
                out.println("    font-size: 19px;");
                out.println("    color: #d6a84f;");
                out.println("    margin-bottom: 12px;");
                out.println("}");

                out.println(".message {");
                out.println("    color: #aaa39a;");
                out.println("    font-family: Arial, sans-serif;");
                out.println("    font-size: 14px;");
                out.println("    line-height: 1.7;");
                out.println("    margin-bottom: 32px;");
                out.println("}");

                out.println(".dashboard-btn {");
                out.println("    display: inline-block;");
                out.println("    padding: 14px 32px;");
                out.println("    background: #d6a84f;");
                out.println("    color: #17120b;");
                out.println("    text-decoration: none;");
                out.println("    font-family: Arial, sans-serif;");
                out.println("    font-weight: bold;");
                out.println("    border-radius: 3px;");
                out.println("    transition: 0.25s;");
                out.println("}");

                out.println(".dashboard-btn:hover {");
                out.println("    background: #efd080;");
                out.println("    transform: translateY(-2px);");
                out.println("}");

                out.println(".home-link {");
                out.println("    display: block;");
                out.println("    margin-top: 24px;");
                out.println("    color: #aaa39a;");
                out.println("    text-decoration: none;");
                out.println("    font-family: Arial, sans-serif;");
                out.println("    font-size: 13px;");
                out.println("}");

                out.println(".home-link:hover {");
                out.println("    color: #d6a84f;");
                out.println("}");

                out.println(".footer {");
                out.println("    text-align: center;");
                out.println("    margin-top: 20px;");
                out.println("    color: #777;");
                out.println("    font-family: Arial, sans-serif;");
                out.println("    font-size: 11px;");
                out.println("    letter-spacing: 1px;");
                out.println("}");

                out.println("@media (max-width: 600px) {");

                out.println("    .page {");
                out.println("        padding: 18px;");
                out.println("    }");

                out.println("    .card {");
                out.println("        padding: 45px 25px 38px;");
                out.println("    }");

                out.println("    h1 {");
                out.println("        font-size: 27px;");
                out.println("    }");

                out.println("}");

                out.println("</style>");

                out.println("</head>");

                out.println("<body>");

                out.println("<div class='page'>");

                out.println("<div class='brand'>♟ <span>AI CHESS</span> ARENA</div>");

                out.println("<div class='card'>");

                out.println("<div class='chess-symbol'>♔</div>");

                out.println("<div class='line'></div>");

                out.println("<h1>Login Successful</h1>");

                out.println("<div class='welcome'>Welcome, "
                        + username +
                        "</div>");

                out.println("<div class='message'>");
                out.println("Your session is active. Your chess arena is ready.");
                out.println("</div>");

                out.println("<a class='dashboard-btn' href='dashboard.html'>");
                out.println("Go to Dashboard &nbsp; →");
                out.println("</a>");

                out.println("<a class='home-link' href='index.html'>");
                out.println("← Back to Home");
                out.println("</a>");

                out.println("</div>");

                out.println("<div class='footer'>");
                out.println("THINK • PLAY • IMPROVE");
                out.println("</div>");

                out.println("</div>");

                out.println("</body>");
                out.println("</html>");

            } else {

                out.println("<!DOCTYPE html>");
                out.println("<html lang='en'>");

                out.println("<head>");
                out.println("<meta charset='UTF-8'>");
                out.println("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
                out.println("<title>Login Failed | AI Chess Arena</title>");

                out.println("<style>");

                out.println("* { box-sizing: border-box; }");

                out.println("body {");
                out.println("    margin: 0;");
                out.println("    min-height: 100vh;");
                out.println("    display: flex;");
                out.println("    align-items: center;");
                out.println("    justify-content: center;");
                out.println("    background: #100c08;");
                out.println("    color: white;");
                out.println("    font-family: Georgia, serif;");
                out.println("}");

                out.println(".card {");
                out.println("    width: 90%;");
                out.println("    max-width: 480px;");
                out.println("    text-align: center;");
                out.println("    padding: 50px 30px;");
                out.println("    background: #1c1711;");
                out.println("    border: 1px solid #765d32;");
                out.println("}");

                out.println(".symbol {");
                out.println("    font-size: 45px;");
                out.println("    color: #c99b45;");
                out.println("    margin-bottom: 20px;");
                out.println("}");

                out.println("h1 {");
                out.println("    color: #e6c778;");
                out.println("}");

                out.println("p {");
                out.println("    color: #aaa;");
                out.println("    font-family: Arial, sans-serif;");
                out.println("}");

                out.println("a {");
                out.println("    display: inline-block;");
                out.println("    margin-top: 20px;");
                out.println("    padding: 12px 25px;");
                out.println("    background: #c99b45;");
                out.println("    color: #111;");
                out.println("    text-decoration: none;");
                out.println("    font-family: Arial, sans-serif;");
                out.println("    font-weight: bold;");
                out.println("}");

                out.println("</style>");
                out.println("</head>");

                out.println("<body>");

                out.println("<div class='card'>");

                out.println("<div class='symbol'>♟</div>");

                out.println("<h1>Login Failed</h1>");

                out.println("<p>Invalid username or password.</p>");

                out.println("<a href='login.html'>Try Again</a>");

                out.println("</div>");

                out.println("</body>");
                out.println("</html>");
            }

            rs.close();
            ps.close();
            con.close();

        } catch (Exception e) {

            out.println("<h2>Login Error</h2>");
            out.println("<p>" + e.getMessage() + "</p>");
        }
    }
}