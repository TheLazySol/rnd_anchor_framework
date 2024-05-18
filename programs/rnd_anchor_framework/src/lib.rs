use anchor_lang::prelude::*;

declare_id!("58ybx3ASqW2gvV8ejmiQfGKAMPrbBkjpipzfnQSN6vLh");

#[program]
pub mod rnd_anchor_framework {
    use super::*;

    pub fn create_ledger(
        ctx: Context<CreateLedger>, // context that is passed to the create_ledger function.
        color: String,
    ) -> Result<()> {
        
        let ledger_account = &mut ctx.accounts.ledger_account; // get the ledger account from the context.
        ledger_account.color = color; // set the color of the ledger account.
        ledger_account.balance = 0; // set the balance of the ledger account.

        Ok(())
    }

    pub fn modify_ledger(
        ctx: Context<ModifyLedger>,
        new_balance: u32,
    ) -> Result<()> {

        let ledger_account = &mut ctx.accounts.ledger_account; // get the ledger account from the context.
        ledger_account.balance = new_balance; // set the balance of the ledger account.

        Ok(())
    }
}

#[derive(Accounts)] // accounts that are passed to the create_ledger function.
#[instruction(color: String)] // instruction that is passed to the create_ledger function. This part of the code needs to be able to know what "color" is when referencing it.
pub struct CreateLedger<'info> {
    #[account(
        init,
        payer = wallet, // this is the wallet that will pay for the creation of the PDA accounts.
        space = 264, // this is the size of the data structure that will be stored in the PDA accounts.
        seeds = [ // PDA account seeds are needed. Use this format to pass them: {wallet.publicKey+"_"+color} in this particular case.
            wallet.key().as_ref(),
            b"_",
            color.as_ref(),
        ], 
        bump
    )] 
    pub ledger_account: Account<'info, Ledger>, // this is the account that will be created in the PDA accounts.
    #[account(mut)]
    pub wallet: Signer<'info>, // this is the wallet that will be used to sign the transaction.
    pub system_program: Program<'info, System>, // this is the system program that will be used to create the PDA accounts.
}

#[derive(Accounts)] // accounts that are passed to the modify_ledger function.
pub struct ModifyLedger<'info> {
    #[account(mut)]
    pub ledger_account: Account<'info, Ledger>, // this is the account that will be modified in the PDA accounts.
    #[account(mut)]
    pub wallet: Signer<'info>, // this is the wallet that will be used to sign the transaction.
}

#[account] // this is the data structure that will be stored in the PDA accounts aka houses the data in the PDA accounts.
pub struct Ledger {
    pub color: String,
    pub balance: u32,
}