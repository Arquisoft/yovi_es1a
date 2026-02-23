Feature: User Login
  As a registered user
  I want to log in with my credentials
  So that I can access the game

  Scenario: Successful login
    Given the login page is open
    When I fill in valid credentials and submit
    Then I should be redirected to the botTester page

  Scenario: Failed login with invalid credentials
    Given the login page is open
    When I fill in invalid credentials and submit
    Then I should see an error message on the screen