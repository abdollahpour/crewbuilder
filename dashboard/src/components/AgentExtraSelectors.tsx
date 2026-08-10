import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import AgentKnowledgeSelector from './AgentKnowledgeSelector'
import AgentMcpSelector from './AgentMcpSelector'
import SkillToolsSelector from './SkillToolsSelector'

type AgentExtraSelectorsProps = {
  selectedTools: string[]
  onToolsChange: (tools: string[]) => void
  selectedMcps: string[]
  onMcpsChange: (mcps: string[]) => void
  selectedKnowledge: string[]
  onKnowledgeChange: (knowledge: string[]) => void
  disabled?: boolean
}

export default function AgentExtraSelectors({
  selectedTools,
  onToolsChange,
  selectedMcps,
  onMcpsChange,
  selectedKnowledge,
  onKnowledgeChange,
  disabled = false,
}: AgentExtraSelectorsProps) {
  const [expanded, setExpanded] = useState(false)
  const selectedCount =
    selectedTools.length + selectedMcps.length + selectedKnowledge.length

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((current) => !current)}
      >
        <IconButton
          size="small"
          aria-label={expanded ? 'Hide extra attachments' : 'Show extra attachments'}
          aria-expanded={expanded}
          onClick={(event) => {
            event.stopPropagation()
            setExpanded((current) => !current)
          }}
        >
          <ExpandMoreIcon
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </IconButton>
        <Typography variant="subtitle1">Extra</Typography>
        <Typography variant="body2" color="text.secondary">
          (optional)
        </Typography>
        {!expanded && selectedCount > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {selectedCount} selected
          </Typography>
        )}
      </Box>

      <Collapse in={expanded}>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <SkillToolsSelector
            selectedTools={selectedTools}
            onChange={onToolsChange}
            disabled={disabled}
          />
          <AgentMcpSelector
            selectedMcps={selectedMcps}
            onChange={onMcpsChange}
            disabled={disabled}
          />
          <AgentKnowledgeSelector
            selectedKnowledge={selectedKnowledge}
            onChange={onKnowledgeChange}
            disabled={disabled}
          />
        </Stack>
      </Collapse>
    </Box>
  )
}
