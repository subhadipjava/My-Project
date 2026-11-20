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

public class StatsServlet extends HttpServlet {

    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);

        if (session == null ||
            session.getAttribute("username") == null) {

            out.print("{\"gamesPlayed\":0,\"wins\":0,\"losses\":0,\"draws\":0}");
            return;
        }

        String username =
                (String) session.getAttribute("username");

        try {

            Connection con = DBConnection.getConnection();

            String sql =
                    "SELECT gs.games_played, gs.wins, gs.losses, gs.draws " +
                    "FROM game_stats gs " +
                    "JOIN users u ON gs.user_id = u.id " +
                    "WHERE u.username = ?";

            PreparedStatement ps =
                    con.prepareStatement(sql);

            ps.setString(1, username);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                out.print(
                    "{\"gamesPlayed\":" + rs.getInt("games_played") +
                    ",\"wins\":" + rs.getInt("wins") +
                    ",\"losses\":" + rs.getInt("losses") +
                    ",\"draws\":" + rs.getInt("draws") + "}"
                );

            } else {

                out.print(
                    "{\"gamesPlayed\":0,\"wins\":0,\"losses\":0,\"draws\":0}"
                );
            }

            rs.close();
            ps.close();
            con.close();

        } catch (Exception e) {

            out.print(
                "{\"gamesPlayed\":0,\"wins\":0,\"losses\":0,\"draws\":0}"
            );
        }
    }
}