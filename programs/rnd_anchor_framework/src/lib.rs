use anchor_lang::prelude::*;

declare_id!("FZkMHQsM2ELE7baJvWJfZcL9cZFdWWNVPCqV2Fz1Eb7u");

#[program]
pub mod rnd_anchor_framework {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
