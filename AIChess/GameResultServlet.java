import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class GameResultServlet extends HttpServlet {

    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);

        if (session == null ||
            session.getAttribute("username") == null) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String username =
                (String) session.getAttribute("username");

        String result = request.getParameter("result");

        try {

            Connection con = DBConnection.getConnection();

            String sql;

            if ("win".equals(result)) {

                sql =
                    "UPDATE game_stats gs " +
                    "JOIN users u ON gs.user_id = u.id " +
                    "SET gs.games_played = gs.games_played + 1, " +
                    "gs.wins = gs.wins + 1 " +
                    "WHERE u.username = ?";

            } else if ("loss".equals(result)) {

                sql =
                    "UPDATE game_stats gs " +
                    "JOIN users u ON gs.user_id = u.id " +
                    "SET gs.games_played = gs.games_played + 1, " +
                    "gs.losses = gs.losses + 1 " +
                    "WHERE u.username = ?";

            } else if ("draw".equals(result)) {

                sql =
                    "UPDATE game_stats gs " +
                    "JOIN users u ON gs.user_id = u.id " +
                    "SET gs.games_played = gs.games_played + 1, " +
                    "gs.draws = gs.draws + 1 " +
                    "WHERE u.username = ?";

            } else {

                response.setStatus(
                    HttpServletResponse.SC_BAD_REQUEST
                );

                con.close();
                return;
            }

            PreparedStatement ps =
                    con.prepareStatement(sql);

            ps.setString(1, username);
ps.executeUpdate();

ps.close();

String historySql =
        "INSERT INTO game_history (user_id, result) " +
        "SELECT id, ? FROM users WHERE username = ?";

PreparedStatement historyPs =
        con.prepareStatement(historySql);

historyPs.setString(1, result);
historyPs.setString(2, username);

historyPs.executeUpdate();

historyPs.close();
con.close();

            response.getWriter().print("success");

        } catch (Exception e) {

    e.printStackTrace();

    response.setStatus(
        HttpServletResponse.SC_INTERNAL_SERVER_ERROR
    );

    response.getWriter().print("error: " + e.getMessage());
}
    }
}