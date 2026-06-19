#!/usr/bin/env python3
"""Comprehensive i18n update for remaining views and settings components."""
import os

PROJECT = "/home/young/ji-cheng/apps/desktop/src/components"

def add_import_t(content):
    if "import { t } from \"$lib/i18n/index.svelte\";" in content:
        return content
    content = content.replace(
        "<script lang=\"ts\">\n",
        "<script lang=\"ts\">\n\timport { t } from \"$lib/i18n/index.svelte\";\n"
    )
    return content

def rep(content, old, new, filename="?"):
    if old in content:
        return content.replace(old, new)
    else:
        print(f"  NOT FOUND in {filename}: {old[:80]}")
        return content

# =====================================================
# VIEWS
# =====================================================
views_dir = PROJECT + "/views"

# StackPanel.svelte - additional replacements
path = views_dir + "/StackPanel.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
c = rep(c, 'title="Staged"', 'title={t("views.staged")}', "StackPanel")
c = rep(c, '"Drop files to stage or commit directly"', '{t("views.dropFilesToStage")}', "StackPanel")
c = rep(c, 'tooltip="Read-only mode"', 'tooltip={t("views.readOnlyMode")}', "StackPanel")
c = rep(c, '>Start a commit…</Button>', '>{t("views.startACommit")}</Button>', "StackPanel")
with open(path, 'w') as f: f.write(c)
print("StackPanel.svelte updated")

# =====================================================
# SETTINGS - text replacements
# =====================================================
s_dir = PROJECT + "/settings"

# GeneralSettings.svelte - remaining text in snippets
path = s_dir + "/GeneralSettings.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
c = rep(c, 'Forget credentials and log out', '{t("settings.forgetCredentialsTitle")}', "GeneralSettings")
c = rep(c, 'Click here to clear your credentials and unwind.', '{t("settings.forgetCredentialsDesc")}', "GeneralSettings")
c = rep(c, 'Default code editor', '{t("settings.defaultCodeEditor")}', "GeneralSettings")
c = rep(c, 'Default terminal', '{t("settings.defaultTerminal")}', "GeneralSettings")
c = rep(c, 'Automatically check for updates', '{t("settings.autoCheckUpdates")}', "GeneralSettings")
c = rep(c, 'Automatically check for updates. You can still check manually when needed.', '{t("settings.autoCheckUpdatesDesc")}', "GeneralSettings")
c = rep(c, 'Remove all projects', '{t("settings.removeAllProjectsTitle")}', "GeneralSettings")
c = rep(c, 'You can delete all projects from the GitButler app.', '{t("settings.removeProjectsDesc")}', "GeneralSettings")
c = rep(c, 'Your code remains safe. it only clears the configuration.', '{t("settings.removeProjectsSafe")}', "GeneralSettings")
c = rep(c, 'Are you sure you want to remove all GitButler projects?', '{t("settings.removeAllProjectsConfirm")}', "GeneralSettings")
with open(path, 'w') as f: f.write(c)
print("GeneralSettings.svelte done")

# ExperimentalSettings.svelte
path = s_dir + "/ExperimentalSettings.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
c = rep(c, 'F Mode Navigation', '{t("settings.fMode")}', "Experimental")
c = rep(c, 'Enable F mode for quick keyboard navigation to buttons using two-letter shortcuts.', '{t("settings.fModeDesc")}', "Experimental")
c = rep(c, 'Single-branch mode', '{t("settings.singleBranch")}', "Experimental")
c = rep(c, 'Stay in the workspace view when leaving the gitbutler/workspace branch.', '{t("settings.singleBranchDesc")}', "Experimental")
c = rep(c, 'New push', '{t("settings.newPush")}', "Experimental")
c = rep(c, 'Use the workspace-based push implementation.', '{t("settings.newPushDesc")}', "Experimental")
c = rep(c, 'New integrate upstream modal', '{t("settings.newIntegrateUpstream")}', "Experimental")
c = rep(c, 'Use the newer upstream integration flow. Disable to use the deprecated modal.', '{t("settings.newIntegrateUpstreamDesc")}', "Experimental")
c = rep(c, 'IRC integration', '{t("settings.ircIntegration")}', "Experimental")
c = rep(c, 'Enable IRC for remote collaboration and automated Claude Code session sharing.', '{t("settings.ircDescTitle")}', "Experimental")
with open(path, 'w') as f: f.write(c)
print("ExperimentalSettings.svelte done")

# GitSettings.svelte
path = s_dir + "/GitSettings.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
c = rep(c, 'Credit GitButler as the committer', '{t("settings.creditCommitter")}', "GitSettings")
c = rep(c, 'Learn more', '{t("common.learnMore")}', "GitSettings")
c = rep(c, 'Auto-fetch frequency', '{t("settings.autoFetchFrequency")}', "GitSettings")
with open(path, 'w') as f: f.write(c)
print("GitSettings.svelte done")

# IntegrationsSettings.svelte
path = s_dir + "/IntegrationsSettings.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
c = rep(c, 'Auto-fill PR/MR descriptions from commit', '{t("settings.autoFillPrDesc")}', "Integrations")
c = rep(c, 'Set the title and description from the commit for single-commit branches.', '{t("settings.autoFillPrDescCaption")}', "Integrations")
with open(path, 'w') as f: f.write(c)
print("IntegrationsSettings.svelte done")

# AiSettings.svelte
path = s_dir + "/AiSettings.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
c = rep(c, 'label: "Use GitButler API"', 'label: t("settings.useGitButlerAPI")', "AiSettings")
c = rep(c, 'label: "Your own key"', 'label: t("settings.yourOwnKey")', "AiSettings")
c = rep(c, 'label="Do you want to provide your own key?"', 'label={t("settings.provideOwnKey")}', "AiSettings")
c = rep(c, 'label="API key"', 'label={t("settings.apiKey")}', "AiSettings")
c = rep(c, 'label="Model version"', 'label={t("settings.modelVersion")}', "AiSettings")
c = rep(c, 'label="Custom endpoint"', 'label={t("settings.customEndpoint")}', "AiSettings")
c = rep(c, 'label="Endpoint"', 'label={t("settings.endpoint")}', "AiSettings")
c = rep(c, 'label="Model"', 'label={t("settings.model")}', "AiSettings")
c = rep(c, 'Amount of provided context', '{t("settings.diffLengthLimit")}', "AiSettings")
with open(path, 'w') as f: f.write(c)
print("AiSettings.svelte done")

# IrcSettings.svelte
path = s_dir + "/IrcSettings.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
c = rep(c, 'Configure IRC integration for remote collaboration on Claude Code sessions.', '{t("settings.ircDesc")}', "IrcSettings")
c = rep(c, 'label="Server Host"', 'label={t("settings.serverHost")}', "IrcSettings")
c = rep(c, 'Auto-share new sessions', '{t("settings.autoShareSessions")}', "IrcSettings")
c = rep(c, 'Automatically share new Claude Code sessions to IRC when connected.', '{t("settings.autoShareSessionsDesc")}', "IrcSettings")
c = rep(c, 'Connect', '{t("settings.connect")}', "IrcSettings")
c = rep(c, '>Disconnect</Button', '>{t("settings.disconnect")}</Button', "IrcSettings")
c = rep(c, 'label="Nickname"', 'label={t("settings.nickname")}', "IrcSettings")
c = rep(c, 'label="Server Password"', 'label={t("settings.serverPassword")}', "IrcSettings")
c = rep(c, 'label="Account Password"', 'label={t("settings.accountPassword")}', "IrcSettings")
c = rep(c, 'label="Real Name"', 'label={t("settings.realName")}', "IrcSettings")
c = rep(c, 'label="Project channel"', 'label={t("settings.projectChannel")}', "IrcSettings")
with open(path, 'w') as f: f.write(c)
print("IrcSettings.svelte done")

# OrganisationSettings.svelte
path = s_dir + "/OrganisationSettings.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
c = rep(c, '>Create an Organizaton</Button', '>{t("settings.createOrganization")}</Button', "OrgSettings")
with open(path, 'w') as f: f.write(c)
print("OrganisationSettings.svelte done")

# TelemetrySettings.svelte - just import
path = s_dir + "/TelemetrySettings.svelte"
with open(path) as f: c = f.read()
c = add_import_t(c)
with open(path, 'w') as f: f.write(c)
print("TelemetrySettings.svelte done")

print("\nAll updates complete!")
