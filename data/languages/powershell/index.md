---
project: CodingDatafy
license: CC BY-SA 4.0
copyright: 2026 CodingDatafy Organization
author: CodingDatafy Team
title: "PowerShell"
id: "powershell-languages"
description: "Comprehensive reference and overview of PowerShell, covering object-based automation, cross-platform scripting, cmdlet architecture, and enterprise configuration management."
---

## Information Card

<dl class="information-card">
	<dt>Language Name</dt><dd>PowerShell</dd>
	<dt>Type</dt><dd>Scripting Language</dd>
	<dt>Designer</dt><dd>Jeffrey Snover</dd>
	<dt>First Appeared</dt><dd>2006</dd>
	<dt>Current Developer</dt><dd>Microsoft Corporation</dd>
	<dt>Filename Extension</dt><dd><code>.ps1</code>, <code>.psm1</code>, <code>.psd1</code></dd>
	<dt>Current Release</dt><dd><a href="https://learn.microsoft.com/powershell/">7.6.5</a></dd>
	<dt>Website</dt><dd><a href="https://microsoft.com/powershell">microsoft.com/powershell</a></dd>
</dl>

## Overview

PowerShell is a cross-platform task automation and configuration management framework consisting of a command-line shell, an object-oriented scripting language, and a robust administrative toolset. Originally designed exclusively for Windows, PowerShell (formerly PowerShell Core) is now open-source and natively runs on Windows, Linux, and macOS.

Unlike traditional text-based shells that process plain string output, PowerShell operates entirely on .NET objects. Commands pass structured object pipelines natively, enabling direct property extraction, precise object manipulation, and seamless integration with the .NET ecosystem.

## Syntax

PowerShell syntax combines command-line verb-noun commands (cmdlets), object pipeline pipelines (`|`), .NET integration, and structured language constructs.

### Basic Application Example

```powershell
using namespace System.Collections.Generic

class UserProfile {
    [string]$UserId
    [string]$Username
    [bool]$IsActive = $true
    [List[string]]$Roles

    UserProfile([string]$id, [string]$name) {
        $this.UserId = $id
        $this.Username = $name
        $this.Roles = [List[string]]::new()
    }

    [void] AddRole([string]$role) {
        if (-not [string]::IsNullOrWhiteSpace($role)) {
            $this.Roles.Add($role)
        }
    }
}

function Get-ProcessedUser {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [UserProfile]$Profile
    )

    process {
        $status = if ($Profile.IsActive) { "Active" } else { "Inactive" }
        return "User $($Profile.Username) ($($Profile.UserId)) is $status"
    }
}
```

### Core Syntax Elements

* **Verb-Noun Naming:** Standardized cmdlet naming conventions using approved verbs (e.g., `Get-Process`, `Start-Service`, `Set-Content`).
* **Object Pipeline:** Data passed between commands retains full .NET class properties and methods (`Select-Object`, `Where-Object`).
* **Variable Prefixes:** All variables begin with a `$` sigil, supporting strong type declarations (`[int]$count = 5`).
* **Comparison Operators:** Uses hyphenated operators instead of mathematical symbols (e.g., `-eq`, `-ne`, `-gt`, `-like`, `-match`).

## Environment

PowerShell executes across Windows, Linux, and macOS environments through modern runtime engines.

### Runtimes & Editions

* **PowerShell 7+:** Cross-platform, open-source edition built on top of modern .NET Core / .NET runtimes.
* **Windows PowerShell:** Legacy Windows-specific shell built on .NET Framework (version 5.1 and earlier).

### Tooling & Ecosystem

* **Package Management:** Centralized package management and module distribution via **PSResourceGet** and the **PowerShell Gallery** (`PSGallery`).
* **Development Tooling:** Visual Studio Code with the official PowerShell extension, integrated debugging, and Interactive PSReadLine support.
* **Configuration Management:** Infrastructure-as-code management using **Desired State Configuration (DSC)** and custom automation modules.

## Security

PowerShell provides robust built-in security features designed to prevent unauthorized script execution and detect malicious activity.

* **Execution Policies:** Configurable safety boundaries (e.g., `RemoteSigned`, `AllSigned`, `Restricted`) preventing accidental script execution.
* **Logging & Auditing:** Enterprise-grade auditing including Script Block Logging, Module Logging, and Transcription Logs.
* **Constrained Language Mode:** Restricts dynamic code execution and access to raw .NET APIs in high-security contexts (AppLocker/WDAC).

## Best Practice

1. **Follow Verb-Noun Naming:** Always use Microsoft-approved verbs for custom function names (`Get-ApprovedVerb`).
2. **Use PSScriptAnalyzer:** Enforce code standards, syntax consistency, and security linting using `Invoke-ScriptAnalyzer`.
3. **Avoid Aliases in Scripts:** Use full cmdlet names and explicit parameter names in production scripts (e.g., `Where-Object` instead of `?`).
4. **Leverage the Object Pipeline:** Pass structured objects across functions and cmdlets rather than building custom text parsers.
5. **Implement Error Handling:** Use `try`/`catch`/`finally` blocks alongside `$ErrorActionPreference = 'Stop'` for robust failure management.