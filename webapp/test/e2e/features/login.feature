Feature: User Login
  As a registered user
  I want to log in with my credentials
  So that I can access the game configuration

  Background:
    Given the login page is open

  Scenario: Successful login with valid credentials
    Given a user exists with username "tester_pro", email "test@example.com" and password "Pass123!"
    When I fill in valid credentials and submit
    Then I should be redirected to the configureGame page

  Scenario: Failed login with invalid credentials
    When I fill in the username "wrong_user" and password "wrong_pass"
    And I submit the login form
    Then I should see an error message for incorrect credentials on the screen

  Scenario: Failed login with empty fields
    When I submit the login form without filling any data
    Then I should see an error message for empty credentials on the screen