#!/usr/bin/env python3
"""Batch i18n update for settings components."""
import os
import re

SETTINGS_DIR = "/home/young/ji-cheng/apps/desktop/src/components/settings"

def add_import_t(content):
    """Add t() import if not present."""
    if "import { t } from \"$lib/i18n/index.svelte\";" in content:
        return content
    # Add after <script lang="ts">\n
    content = content.replace(
        "<script lang=\"ts\">\n",
        "<script lang=\"ts\">\n\timport { t } from \"$lib/i18n/index.svelte\";\n"
    )
    return content

def do_replacements(filename, replacements):
    path = os.path.join(SETTINGS_DIR, filename)
    if not os.path.exists(path):
        print(f"  SKIP: {filename} not found")
        return
    
    with open(path, 'r') as f:
        content = f.read()
    
    content = add_import_t(content)
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"  NOT FOUND: {old[:70]}...")
    
    with open(path, 'w') as f:
        f.write(content)
    print(f"  OK: {filename}")

# GeneralSettings.svelte
do_replacements("GeneralSettings.svelte", [
    ('"Please use a valid image file"', 't("settings.invalidImageFile")'),
    ('label="Full name"', 'label={t("settings.fullName")}'),
    ('label="Email"', 'label={t("settings.email")}'),
    ('>Update profile</Button>', '>{t("settings.updateProfile")}</Button>'),
    ('>Forget credentials</Button', '>{t("settings.forgetCredentials")}</Button'),
    ('>Remove projects…</Button>', '>{t("settings.removeProjects")}</Button>'),
    ('>Remove</Button>', '>{t("common.delete")}</Button>'),
    ('>Cancel</Button', '>{t("common.cancel")}</Button'),
    ('title="Remove all projects"', 'title={t("settings.removeAllProjects")}'),
])

# ExperimentalSettings.svelte
do_replacements("ExperimentalSettings.svelte", [
    ('>F Mode Navigation<', '>{t("settings.fMode")}<'),
    ('>Single-branch mode<', '>{t("settings.singleBranch")}<'),
    ('>New push<', '>{t("settings.newPush")}<'),
    ('>New integrate upstream modal<', '>{t("settings.newIntegrateUpstream")}<'),
    ('>IRC integration<', '>{t("settings.ircIntegration")}<'),
])

# GitSettings.svelte
do_replacements("GitSettings.svelte", [
    ('"Learn more"', 't("common.learnMore")'),
])

# AiSettings.svelte
do_replacements("AiSettings.svelte", [
    ('label: "Use GitButler API"', 'label: t("settings.useGitButlerAPI")'),
    ('label: "Your own key"', 'label: t("settings.yourOwnKey")'),
    ('label: "GPT 5.4"', 'label: "GPT 5.4"'),  # Keep model names
    ('label: "GPT 5.4 Mini"', 'label: "GPT 5.4 Mini"'),
    ('label: "GPT 5.4 Nano (recommended)"', 'label: "GPT 5.4 Nano"'),
    ('label: "Haiku (recommended)"', 'label: "Haiku"'),
    ('label: "Sonnet"', 'label: "Sonnet"'),
    ('label: "Opus"', 'label: "Opus"'),
    ('label="Do you want to provide your own key?"', 'label={t("settings.provideOwnKey")}'),
    ('label="API key"', 'label={t("settings.apiKey")}'),
    ('label="Model version"', 'label={t("settings.modelVersion")}'),
    ('label="Custom endpoint"', 'label={t("settings.customEndpoint")}'),
    ('label="Endpoint"', 'label={t("settings.endpoint")}'),
    ('label="Model"', 'label={t("settings.model")}'),
    ('label="Amount of provided context"', 'label={t("settings.diffLengthLimit")}'),
])

# IrcSettings.svelte
do_replacements("IrcSettings.svelte", [
    ('label="Server Host"', 'label={t("settings.serverHost")}'),
    ('label="Nickname"', 'label={t("settings.nickname")}'),
    ('label="Server Password"', 'label={t("settings.serverPassword")}'),
    ('label="Account Password"', 'label={t("settings.accountPassword")}'),
    ('label="Real Name"', 'label={t("settings.realName")}'),
    ('label="Project channel"', 'label={t("settings.projectChannel")}'),
    ('>Disconnect</Button>', '>{t("settings.disconnect")}</Button>'),
])

# IntegrationsSettings.svelte
do_replacements("IntegrationsSettings.svelte", [])

# OrganisationSettings.svelte
do_replacements("OrganisationSettings.svelte", [
    ('>Create an Organizaton</Button>', '>{t("settings.createOrganization")}</Button>'),
])

# TelemetrySettings.svelte - just the import
do_replacements("TelemetrySettings.svelte", [])

print("\nSettings components done!")
