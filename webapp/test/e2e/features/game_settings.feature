Feature: Game Settings
  Validate the match configuration screen and dynamic UI changes

  Scenario: Configure a game against an Expert Bot
    Given I am logged in and on the game configuration page
    When I select the mode "Contra la Máquina (1 Jugador)"
    And I set the board size to "7"
    And I select the difficulty "Experto"
    And I select the opponent "Monte Carlo"
    And I select the starting player "Empiezo el usuario logeado (Fichas Azules)"
    And I click the play button
    Then I should be redirected to the game board

  Scenario: Configure a Local Multiplayer game
    Given I am logged in and on the game configuration page
    When I select the mode "Multijugador Local (2 Jugadores)"
    And I set the board size to "5"
    Then the bot difficulty options should disappear
    When I select "B" as the starting player
    And I click the play button
    Then I should be redirected to the game board
