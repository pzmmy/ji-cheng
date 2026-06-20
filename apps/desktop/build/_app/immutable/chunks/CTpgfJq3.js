import{g as f,e as h,f as o}from"./DEVj8csf.js";import{S as b}from"./DnfITQ7V.js";import{p as k}from"./Bl5Ts5N6.js";function M(e){return o(!1,"projectCommitGenerationExtraConcise_"+e)}function R(e){return o(!1,"projectCommitGenerationHaiku_"+e)}function I(e){return o(!1,"projectCommitGenerationUseEmojis_"+e)}function O(e){return o(!1,"projectAiGenEnabled_"+e)}function F(e){return o(!1,"projectAiExperimentalFeaturesEnabled_"+e)}function P(e){return o(!1,"projectRunCommitHooks_"+e)}const l="swallowGitHubOrgAuthErrors";function E(e){h(l,e)}function G(){return f(l)??!1}function N(e){return o(!1,"dismissedForgeIntegrationPrompt_"+e)}const c="GitHub Organizations OAuth Error",v={"Although you appear to have the correct authorization credentials,":c},_={label:"Don't show this again",onClick:()=>E(!0)},A={PreconditionFailed:{severity:"warning"},ProjectGitAuth:{severity:"warning",userMessage:"Authentication failed. Check that your git credentials are configured correctly."},DefaultTargetNotFound:{severity:"silent"},CommitSigningFailed:{severity:"error",userMessage:`
Commit signing failed and has now been disabled. You can configure commit signing in the project settings.

Please check our [documentation](https://docs.gitbutler.com/features/virtual-branches/signing-commits) on setting up commit signing and verification.
		`},RepoOwnership:{severity:"error",userMessage:`
The repository ownership couldn't be determined. Consider allowing it using:

    git config --global --add safe.directory copy/of/path/shown/below
	`},SecretKeychainNotFound:{severity:"error",userMessage:`
Please install a keychain service to store and retrieve secrets with.

This can be done using \`sudo apt install gnome-keyring\` for instance.
	`},MissingLoginKeychain:{severity:"error",userMessage:"\nMissing default keychain.\n\nWith `seahorse` or equivalent, create a `Login` password store, right click it and choose `Set Default`.\n	"},GitHubTokenExpired:{severity:"error",userMessage:`
Your GitHub token appears expired. Please log out and back in to refresh it. (Settings -> Integrations -> Forget)
	`},ProjectDatabaseIncompatible:{severity:"error",userMessage:`
The database was changed by a more recent version of GitButler - cannot safely open it anymore.
	`},DefaultTerminalNotFound:{severity:"error",userMessage:`
Your default terminal was not found. Please select your preferred terminal in Settings > General.
	`}};function w(e){return e.startsWith("undefined is not an object (evaluating 'first_child_getter.call')")}const S=[{matches:({code:e,message:t})=>e==="Unknown"&&t.includes("cargo build -p gitbutler-git"),classification:{severity:"error",userMessage:"The `gitbutler-git` binary is missing. Run `cargo build -p gitbutler-git` to build it."}}];function j(e){for(const[t,a]of Object.entries(v))if(e.startsWith(t))return a}function U(e,t){var u;if(e instanceof b)return{title:t??e.name,message:e.message,severity:"silent"};const{name:a,message:i,code:n,origin:g}=k(e),s=a??j(i)??t??i;if(w(i))return{title:s,message:i,code:n,severity:"silent"};if(g==="http"&&i==="Load failed")return{title:s,message:i,code:n,severity:"silent"};if(s===c&&G())return{title:s,message:i,code:n,severity:"silent"};const d=(u=S.find(p=>p.matches({code:n,message:i})))==null?void 0:u.classification,m=n?A[n]:void 0,r=d??m;if((r==null?void 0:r.severity)==="silent")return{title:s,message:i,code:n,severity:"silent"};const y=(r==null?void 0:r.actionHint)??(s===c?_:void 0);return{title:s,message:i,code:n,severity:(r==null?void 0:r.severity)??"error",userMessage:r==null?void 0:r.userMessage,actionHint:y}}export{P as a,N as b,U as c,M as d,I as e,R as f,F as g,O as p};
//# sourceMappingURL=CTpgfJq3.js.map
