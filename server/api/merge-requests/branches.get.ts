import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default defineEventHandler(async () => {
  try {
    console.log('Fetching branches using AWS CLI...')
    
    const { stdout, stderr } = await execAsync(
      'aws codecommit list-branches --repository-name F88.LOS.UI --region ap-southeast-1 --profile landingzone'
    )
    
    if (stderr) {
      console.error('AWS CLI Error:', stderr)
      throw new Error(stderr)
    }
    
    const result = JSON.parse(stdout)
    console.log('AWS CLI Response:', result)
    
    return result.branches
  } catch (error: any) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw createError({
      statusCode: 500,
      message: `Failed to fetch branches from AWS CodeCommit: ${error.message}`
    })
  }
}) 