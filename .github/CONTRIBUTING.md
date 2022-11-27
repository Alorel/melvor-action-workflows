# What belongs and doesn't belong in the main mod

The main mod aims to achieve the following goals:

1. Give other mod authors sufficient tools to develop a suite of actions, triggers & workflows
1. Provide a baseline set of functionality that most people would need & that can act as a good example for potential mod authors
1. Offer a convenient UI to control it all

Therefore:

1. Actions & triggers should likely be coded as a separate mod. This is especially true for triggers which add a tiny bit of performance overhead whether they're used or not.
1. Anything else should be discussed via an issue before any work is done

One of Action Workflows' big strengths is its modularity - let's try to capitalise on it whenever it makes sense :slightly_smiling_face: 

# Commit guidelines & review process

1. Commits messages must follow [Semantic PRs](https://github.com/Ezard/semantic-prs) formatting: `type: Actual message`
   - Permitted types are listed in [semantic.yml](/Alorel/melvor-mod/blob/master/.github/semantic.yml)
   - Do not use a scope
1. All continuous integration checks on your pull request must pass
1. The PR may be put on hold if its functionality can be achieved in a better way once another issue is solved.
1. @Alorel might push to your PR's branch if it only requires small styling tweaks 
1. Changes will typically get published to [mod.io](https://mod.io/g/melvoridle/m/action-workflows) within the same day.
