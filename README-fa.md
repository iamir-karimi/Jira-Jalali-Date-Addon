# Jira Jalali Add-on 1.1.5

# Jira Jalali Date Addon

Jira Jalali Date Addon is a lightweight Persian/Jalali date enhancement add-on for Jira Server and Jira Data Center.

This add-on improves the Jira date experience for Persian-speaking teams by adding Jalali date display and a Persian date picker while keeping Jira's internal Gregorian date values compatible with Jira workflows, boards, issue fields, work logs, and reports.

## Features

* Persian / Jalali date picker for Jira date fields
* Jalali date display for common Jira date formats
* Support for Jira Log Work / Date Started field
* Persian date formatting in issue details and activity areas
* Keeps Jira main layout LTR to prevent dashboard and board layout issues
* Applies RTL only to Persian text and user-entered Persian content
* Persian-friendly placeholder and input alignment
* Optional Persian font support
* Compatible with Jira Server / Data Center

## Installation

1. Download the latest `.jar` file from the Releases section.
2. Open Jira Administration.
3. Go to:

```text
Manage apps → Upload app
```

4. Upload the `.jar` file.
5. After installation, hard refresh Jira:

```text
Ctrl + Shift + R
```

6. Open the browser console and check that the add-on has loaded.

## Build from Source

Requirements:

* Java
* Maven
* Atlassian Plugin SDK or a compatible Maven setup

Build command:

```bash
mvn clean package
```

The final installable Jira add-on file will be generated inside:

```text
target/
```

## Font Notice

This repository does not redistribute commercial Persian fonts.

If you have a licensed Persian font such as IRANYekan, you can place the font files inside:

```text
src/main/resources/fonts/
```

Recommended file names:

```text
IRANYekanXVF.woff
IRANYekanXVF.woff2
```

Then rebuild the add-on.

## Important Notes

* Jira internally still stores dates in Gregorian format.
* This add-on only improves the user interface and Persian/Jalali date experience.
* It is recommended to test the add-on on a staging Jira instance before installing it on production.

## Author

Created by AmirHossein Karimi
Website: https://iamirs.ir/

Vendor: Fakharei Marketing Agency

## Repository

https://github.com/iamir-karimi/Jira-Jalali-Date-Addon

## License

This project can be published under the MIT License, unless you choose another license.
