Feature: User Login
  As a registered user
  I want to log in with my credentials
  So that I can access the game

  Scenario: Successful login
    Given a user exists with username "adriangg", email "adriangg@gmail.com" and password "1234"
    And the login page is open 
    When I fill in valid credentials and submit
    Then I should be redirected to the configureGame page

  Scenario: Failed login with invalid credentials
    Given the login page is open
    When I fill in invalid credentials and submit
    Then I should see an error message for incorrect credentials on the screen

  Scenario: Failed login with empty fields
    Given the login page is open
    When I leave the credentials empty and submit
    Then I should see an error message for empty credentials on the screen
