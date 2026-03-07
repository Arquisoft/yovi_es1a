Feature: Register
  Validate the registration flow starting from the home screen

  Scenario: Navigate and create a new account successfully
    Given I am on the home page
    When I click the "Create Account" button
    And I enter a unique username, email and password
    And I click the "Lets go!" button
    Then I should see a welcome message containing "User successfully created"

  Scenario: Try to register with an already existing user
    Given the user "Alice" with email "alice@test.com" and password "123456" is already registered
    And I am on the home page
    When I click the "Create Account" button
    And I enter username "Alice", email "alice@test.com" and password "123456"
    And I click the "Lets go!" button
    Then I should see an error message indicating the user already exists

  Scenario: Try to register leaving all fields empty
    Given I am on the home page
    When I click the "Create Account" button
    And I leave all fields empty
    And I click the "Lets go!" button
    Then I should not be redirected and stay on the register page

  Scenario: Try to register with a password that is too short
    Given I am on the home page
    When I click the "Create Account" button
    And I enter username "Bob", email "bob@test.com" and password "12"
    And I click the "Lets go!" button
    Then I should not be redirected and stay on the register page