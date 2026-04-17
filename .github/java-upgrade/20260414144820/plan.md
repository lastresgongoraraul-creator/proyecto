# Java Upgrade Plan

## Project Summary
- Project: `Proyecto` backend module
- Location: `backend/pom.xml`
- Current runtime: Java 17
- Current Spring Boot: 3.2.4
- Upgrade target: latest LTS Java runtime (Java 21)
- Build system: Maven

## Goals
- Upgrade the backend module runtime target from Java 17 to Java 21
- Keep Spring Boot at 3.2.4, since it already supports Java 21
- Ensure the backend compiles and tests cleanly under Java 21

## Available Tools
- Java 17.0.3.1 at `C:\Program Files\jdk-17.0.3.1\bin`
- Java 21.0.4 at `C:\Program Files\jdk-21.0.4\bin`
- Maven: not detected on PATH or via wrapper
- Maven Wrapper: not present in repository

## Derived Upgrades
- Java runtime property in `backend/pom.xml` to `21`
- Maven installation will be required to execute validation commands

## Key Challenges
- No Maven executable or wrapper detected, so Maven must be installed before validation
- The backend has no existing Maven wrapper, so the environment must be defined explicitly
- There are no backend unit tests present, so validation will rely on clean Maven compile/test execution

## Upgrade Steps

### Step 1: Setup Environment
- Install Maven 3.9.11 or latest compatible Maven version
- Confirm JDK 21 is available and use `C:\Program Files\jdk-21.0.4\bin`
- No project files will be changed in this step

### Step 2: Setup Baseline
- Run Maven baseline validation using current Java 17 environment if Maven installed, or JDK 21 if available
- Commands:
  - `mvn -v`
  - `mvn -B clean test`
- Record baseline compile and test status

### Step 3: Upgrade Java Runtime
- Update `<java.version>` in `backend/pom.xml` from `17` to `21`
- Verify there are no additional compiler plugin overrides required

### Step 4: Validate Upgrade
- Run `mvn -B clean test` under JDK 21
- Confirm backend compiles and the test phase passes

## Plan Review
- This upgrade is intentionally minimal: only the runtime target changes
- Spring Boot 3.2.4 is compatible with Java 21, so no framework version bump is required
- The main external dependency risk is Maven availability; if Maven is installed, the runtime change should be straightforward

## Notes
- `GIT_AVAILABLE=true`
- `current_branch=main`
- `current_commit_id=N/A`
- `session_id=20260414144820`
