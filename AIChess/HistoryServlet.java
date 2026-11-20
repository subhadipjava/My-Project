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

public class HistoryServlet extends HttpServlet {

    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);

        if (session == null ||
            session.getAttribute("username") == null) {

            out.print("[]");
            return;
        }

        String username =
                (String) session.getAttribute("username");

        try {

            Connection con = DBConnection.getConnection();

            String sql =
                    "SELECT gh.result, gh.played_at " +
                    "FROM game_history gh " +
                    "JOIN users u ON gh.user_id = u.id " +
                    "WHERE u.username = ? " +
                    "ORDER BY gh.played_at DESC";

            PreparedStatement ps =
                    con.prepareStatement(sql);

            ps.setString(1, username);

            ResultSet rs = ps.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {

                if (!first) {
                    json.append(",");
                }

                json.append("{");
                json.append("\"result\":\"")
                    .append(rs.getString("result"))
                    .append("\",");
                json.append("\"playedAt\":\"")
                    .append(rs.getString("played_at"))
                    .append("\"");
                json.append("}");

                first = false;
            }

            json.append("]");

            out.print(json.toString());

            rs.close();
            ps.close();
            con.close();

        } catch (Exception e) {

            e.printStackTrace();
            out.print("[]");
        }
    }
}